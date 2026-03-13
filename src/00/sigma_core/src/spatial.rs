//! Spatial Fabric Topology & Cognition Grid

use crate::{GRID_CELLS, GRID_W, SPATIAL_CELL_SIZE, WORLD_MAX_X, WORLD_MAX_Y};
use crate::memory::{SigmaState, MAX_ATOMS};

impl SigmaState {
    /// Rebuilds the 140x80 spatial hash grid for collision detection and neighbor awareness.
    /// Perfectly maps to the TypeScript bit-for-bit implementation.
    pub fn build_spatial_hash(&mut self) -> (i32, i32) {
        // Slot 31 is the phase slot, slots 1..30 are for atoms
        let phase_slot = 31;
        let max_atom_slots = 30;

        // 1. Clear Grid and Quorum
        self.matrix.spatial_grid[..].fill(0);
        self.matrix.quorum[..].fill(0);

        let spatial_atomic = self.spatial_grid_atomic();
        let quorum_atomic = self.quorum_atomic();

        let mut overflow_count = 0;
        let mut max_cell_count = 0;

        // 2. Bin Atoms
        for idx in 0..MAX_ATOMS {
            if self.matrix.ids[idx] == 0 {
                continue; // Skip dead atoms
            }

            let mut x = (self.matrix.xs[idx] as i32) / 100;
            let mut y = (self.matrix.ys[idx] as i32) / 100;

            if x < 0 {
                x = 0;
            }
            if x > WORLD_MAX_X {
                x = WORLD_MAX_X;
            }
            if y < 0 {
                y = 0;
            }
            if y > WORLD_MAX_Y {
                y = WORLD_MAX_Y;
            }

            let cell_x = (x / SPATIAL_CELL_SIZE) as usize;
            let cell_y = (y / SPATIAL_CELL_SIZE) as usize;
            let cell_idx = (cell_y * (GRID_W as usize)) + cell_x;

            let sg_base = cell_idx * 32;

            // Atomically reserve a slot
            let slot_idx =
                spatial_atomic[sg_base].fetch_add(1, std::sync::atomic::Ordering::Relaxed);
            let next_slot = slot_idx + 1; // 1-based internal slot count

            if next_slot <= max_atom_slots {
                // Store atom index in the grid slot
                spatial_atomic[sg_base + (next_slot as usize)]
                    .store(idx as i32, std::sync::atomic::Ordering::Relaxed);

                // Accumulate Phase into slot 31 (phase_slot)
                let my_phase = self.matrix.phase[idx] as i32;
                spatial_atomic[sg_base + phase_slot]
                    .fetch_add(my_phase, std::sync::atomic::Ordering::Relaxed);

                // Role quorum counting
                let role = self.matrix.roles[idx];
                let safe_role = if role > 7 { 7 } else { role as usize };

                let q_base = cell_idx * 8;
                quorum_atomic[q_base + safe_role]
                    .fetch_add(1, std::sync::atomic::Ordering::Relaxed);

                if next_slot > max_cell_count {
                    max_cell_count = next_slot;
                }
            } else {
                overflow_count += 1;
            }
        }

        // 3. Finalize Phase Averages
        for i in 0..GRID_CELLS {
            let sg_base = i * 32;
            let count = spatial_atomic[sg_base].load(std::sync::atomic::Ordering::Relaxed);
            if count > 0 {
                let sum =
                    spatial_atomic[sg_base + phase_slot].load(std::sync::atomic::Ordering::Relaxed);
                spatial_atomic[sg_base + phase_slot]
                    .store(sum / count, std::sync::atomic::Ordering::Relaxed);
            }
        }

        (overflow_count, max_cell_count)
    }

    /// Helper to get number of atoms in a specific grid cell
    pub fn get_spatial_grid_count(&self, gx: i32, gy: i32) -> i32 {
        let cell_idx = (gy * GRID_W + gx) as usize;
        self.matrix.spatial_grid[cell_idx * 32]
    }

    /// Helper to get a specific atom index from a grid cell
    pub fn get_spatial_grid_atom(&self, gx: i32, gy: i32, sub_idx: i32) -> i32 {
        let cell_idx = (gy * GRID_W + gx) as usize;
        self.matrix.spatial_grid[cell_idx * 32 + ((sub_idx + 1) as usize)]
    }
}
