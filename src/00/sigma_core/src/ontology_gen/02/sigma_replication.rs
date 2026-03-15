// SSoT: src/ontology/host/sigma_replication.md
// Substrate Node: sigma_replication
// Level: 2
// Manages autopoietic mitosis processes and genome verification

#![allow(unused_imports)]
use super::super::L01::*;

// Replication Engine
// Handles the queued spawn requests and materializes new atoms into the Matrix at the end of each tick.

use crate::{SigmaState, MAX_ATOMS};
use crate::{SPAWN_MAX, SPAWN_SLOT};

impl SigmaState {
    /// Pushes a spawn request into the ring-buffer at the current write head.
    /// Uses Atomic bounds allowing multiple threads to queue concurrently.
    /// `owner_idx`: ID of the parent atom replicating
    /// `cx, cy`: Coordinates for the child
    /// `energy`: Provisioned starting energy
    pub fn push_spawn_request(&self, owner_idx: usize, cx: i32, cy: i32, energy: i32) {
        let spawn_atomic = self.spawn_requests_atomic(); // index 0 is write_head, 1 is read_head

        let read_head = spawn_atomic[1].load(std::sync::atomic::Ordering::Acquire);

        // Atomically claim the next slot in the ring buffer
        let mut write_head = spawn_atomic[0].load(std::sync::atomic::Ordering::Acquire);
        loop {
            if write_head - read_head >= SPAWN_MAX {
                return; // Buffer full
            }
            match spawn_atomic[0].compare_exchange(
                write_head,
                write_head + 1,
                std::sync::atomic::Ordering::AcqRel,
                std::sync::atomic::Ordering::Acquire,
            ) {
                Ok(_) => break, // claim confirmed
                Err(new_write_head) => write_head = new_write_head,
            }
        }

        // We claimed `write_head`. Now write payload specifically into our reserved slot.
        let slot_off = 8 + ((write_head % SPAWN_MAX) * SPAWN_SLOT) as usize;
        let p_id = self.matrix.ids[owner_idx];

        // Write p_id (low 32, high 32)
        let pid_lo = (p_id & 0xFFFFFFFF) as i32;
        let pid_hi = (p_id >> 32) as i32;

        unsafe {
            // Note: Since each thread has a UNIQUE slot (`write_head` is atomic), we can bypass Rust's
            // interior mutability checks purely for `spawn_requests` payload area using unsafe raw pointers.
            let req_ptr = self.matrix.spawn_requests.as_ptr() as *mut u8;

            std::ptr::copy_nonoverlapping(pid_lo.to_le_bytes().as_ptr(), req_ptr.add(slot_off), 4);
            std::ptr::copy_nonoverlapping(
                pid_hi.to_le_bytes().as_ptr(),
                req_ptr.add(slot_off + 4),
                4,
            );

            std::ptr::copy_nonoverlapping(
                (cx as i16).to_le_bytes().as_ptr(),
                req_ptr.add(slot_off + 8),
                2,
            );
            std::ptr::copy_nonoverlapping(
                (cy as i16).to_le_bytes().as_ptr(),
                req_ptr.add(slot_off + 10),
                2,
            );

            std::ptr::copy_nonoverlapping(
                energy.to_le_bytes().as_ptr(),
                req_ptr.add(slot_off + 12),
                4,
            );

            let logic = self.matrix.logic[owner_idx];
            std::ptr::copy_nonoverlapping(logic.as_ptr(), req_ptr.add(slot_off + 16), 8);
        }
    }

    /// Evaluates the spawn buffer at the end of the frame, copying instructions from known parent IDs.
    pub fn drain_spawn_requests(&mut self, tick: i32) -> i32 {
        let header_slice: &[u8; 8] = self.matrix.spawn_requests[0..8].try_into().unwrap();
        let write_head = i32::from_le_bytes(header_slice[0..4].try_into().unwrap());
        let read_head = i32::from_le_bytes(header_slice[4..8].try_into().unwrap());

        let mut cursor = read_head;
        let mut spawned = 0;
        let mut free_search_cursor = self.free_search_cursor; // 0 is null atom

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

                // O(1) Search via index hinting: The lower 32-bits of p_id contain the parent index
                let parent_hint = (p_id & 0xFFFFFFFF) as usize;
                let mut parent_idx = 0;
                if parent_hint > 0
                    && parent_hint < MAX_ATOMS
                    && self.matrix.ids[parent_hint] == p_id
                {
                    parent_idx = parent_hint;
                } else {
                    // Fallback to linear search in case of desync
                    for i in 1..MAX_ATOMS {
                        if self.matrix.ids[i] == p_id {
                            parent_idx = i;
                            break;
                        }
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

                    // CRISPR Inheritance
                    // Pass adaptive immunity (Reg 13) down to the child
                    self.matrix.context[f][13] = self.matrix.context[parent_idx][13];

                    free_search_cursor = (free_idx as usize + 1) % MAX_ATOMS;
                }
            }
            cursor += 1;
            spawned += 1;
        }

        // Close transaction
        self.matrix.spawn_requests[4..8].copy_from_slice(&cursor.to_le_bytes());
        self.free_search_cursor = free_search_cursor;
        spawned
    }
}