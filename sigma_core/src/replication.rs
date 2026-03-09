//! Replication Engine
//! Handles the queued spawn requests and materializes new atoms into the Matrix at the end of each tick.

use crate::memory::{SigmaState, MAX_ATOMS};

pub const SPAWN_MAX: i32 = 1024;
pub const SPAWN_SLOT: i32 = 24;

impl SigmaState {
    /// Pushes a spawn request into the ring-buffer at the current write head.
    /// `owner_idx`: ID of the parent atom replicating
    /// `cx, cy`: Coordinates for the child
    /// `energy`: Provisioned starting energy
    pub fn push_spawn_request(&mut self, owner_idx: usize, cx: i32, cy: i32, energy: i32) {
        let write_head: i32;
        let read_head: i32;

        let header_slice: &[u8; 8] = self.matrix.spawn_requests[0..8].try_into().unwrap();
        write_head = i32::from_le_bytes(header_slice[0..4].try_into().unwrap());
        read_head = i32::from_le_bytes(header_slice[4..8].try_into().unwrap());

        if write_head - read_head >= SPAWN_MAX {
            return; // Buffer full
        }

        let slot_off = 8 + ((write_head % SPAWN_MAX) * SPAWN_SLOT) as usize;
        let p_id = self.matrix.ids[owner_idx];

        // Write p_id (low 32, high 32)
        let pid_lo = (p_id & 0xFFFFFFFF) as i32;
        let pid_hi = (p_id >> 32) as i32;

        self.matrix.spawn_requests[slot_off..slot_off + 4].copy_from_slice(&pid_lo.to_le_bytes());
        self.matrix.spawn_requests[slot_off + 4..slot_off + 8]
            .copy_from_slice(&pid_hi.to_le_bytes());

        self.matrix.spawn_requests[slot_off + 8..slot_off + 10]
            .copy_from_slice(&(cx as i16).to_le_bytes());
        self.matrix.spawn_requests[slot_off + 10..slot_off + 12]
            .copy_from_slice(&(cy as i16).to_le_bytes());

        self.matrix.spawn_requests[slot_off + 12..slot_off + 16]
            .copy_from_slice(&energy.to_le_bytes());

        let logic = self.matrix.logic[owner_idx];
        self.matrix.spawn_requests[slot_off + 16..slot_off + 24].copy_from_slice(&logic);

        // Advance write head
        let next_write_head = write_head + 1;
        self.matrix.spawn_requests[0..4].copy_from_slice(&next_write_head.to_le_bytes());
    }

    /// Evaluates the spawn buffer at the end of the frame, copying instructions from known parent IDs.
    pub fn drain_spawn_requests(&mut self, tick: i32) -> i32 {
        let header_slice: &[u8; 8] = self.matrix.spawn_requests[0..8].try_into().unwrap();
        let write_head = i32::from_le_bytes(header_slice[0..4].try_into().unwrap());
        let read_head = i32::from_le_bytes(header_slice[4..8].try_into().unwrap());

        let mut cursor = read_head;
        let mut spawned = 0;
        let mut free_search_cursor = 1; // 0 is null atom

        while cursor != write_head && spawned < 64 {
            let slot_off = 8 + ((cursor % SPAWN_MAX) * SPAWN_SLOT) as usize;

            let pid_lo = i32::from_le_bytes(
                self.matrix.spawn_requests[slot_off..slot_off + 4]
                    .try_into()
                    .unwrap(),
            );
            let pid_hi = i32::from_le_bytes(
                self.matrix.spawn_requests[slot_off + 4..slot_off + 8]
                    .try_into()
                    .unwrap(),
            );
            let g_lo = pid_lo;

            if g_lo != 0 {
                let p_id = (pid_lo as u32 as u64) | ((pid_hi as u32 as u64) << 32);

                let cx = i16::from_le_bytes(
                    self.matrix.spawn_requests[slot_off + 8..slot_off + 10]
                        .try_into()
                        .unwrap(),
                ) as i32;
                let cy = i16::from_le_bytes(
                    self.matrix.spawn_requests[slot_off + 10..slot_off + 12]
                        .try_into()
                        .unwrap(),
                ) as i32;
                let energy_scaled = i32::from_le_bytes(
                    self.matrix.spawn_requests[slot_off + 12..slot_off + 16]
                        .try_into()
                        .unwrap(),
                );

                let mut logic: [u8; 8] = [0; 8];
                logic.copy_from_slice(&self.matrix.spawn_requests[slot_off + 16..slot_off + 24]);

                // Find parent index based on p_id mapped
                let mut parent_idx = 0;
                for i in 1..MAX_ATOMS {
                    if self.matrix.ids[i] == p_id {
                        parent_idx = i;
                        break;
                    }
                }

                // Find Free Slot
                let mut free_idx: i32 = -1;
                for i in 0..MAX_ATOMS {
                    let search = (free_search_cursor + i) % MAX_ATOMS;
                    if search != 0 && self.matrix.ids[search] == 0 {
                        free_idx = search as i32;
                        break;
                    }
                }

                if free_idx != -1 && parent_idx != 0 {
                    let child_id = ((tick as i64) << 32) | (free_idx as i64);
                    let f = free_idx as usize;

                    self.matrix.ids[f] = child_id as u64;
                    self.matrix.xs[f] = cx as i16;
                    self.matrix.ys[f] = cy as i16;
                    self.matrix.energy[f] = energy_scaled;
                    self.matrix.logic[f] = logic;

                    // Copy 64 bytes of ASM instructions from parent
                    self.matrix.instructions[f] = self.matrix.instructions[parent_idx];

                    // Reset fresh state
                    self.matrix.resonance[f] = 0;
                    self.matrix.phase[f] = 0;
                    self.matrix.context[f] = [0; 16];
                    self.matrix.context[f][8] = 0; // PC

                    free_search_cursor = (free_idx as usize + 1) % MAX_ATOMS;
                }
            }
            cursor += 1;
            spawned += 1;
        }

        // Close transaction
        self.matrix.spawn_requests[4..8].copy_from_slice(&cursor.to_le_bytes());
        spawned
    }
}
