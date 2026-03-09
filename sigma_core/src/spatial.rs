//! Spatial Fabric Topology & Cognition Grid

use crate::memory::{SigmaState, MAX_ATOMS};

impl SigmaState {
    /// Rebuilds the 140x80 spatial hash grid for collision detection and neighbor awareness.
    /// Perfectly maps to the TypeScript bit-for-bit implementation.
    pub fn build_spatial_hash(&mut self) -> (i32, i32) {
        let grid_cols = 140;
        let total_cells = 11200;
        let cell_capacity = 31;
        let max_atom_slots = cell_capacity - 1;

        // 1. Clear Grid and Quorum
        for i in 0..total_cells {
            let sg_base = i * 32;
            self.matrix.spatial_grid[sg_base] = 0; // Clear count

            // Clear Quorum (8 roles)
            let q_base = i * 8;
            for role in 0..8 {
                self.matrix.quorum[q_base + role] = 0;
            }
        }

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
            if x > 1399 {
                x = 1399;
            }
            if y < 0 {
                y = 0;
            }
            if y > 799 {
                y = 799;
            }

            let cell_x = (x / 10) as usize;
            let cell_y = (y / 10) as usize;
            let cell_idx = (cell_y * grid_cols) + cell_x;

            let sg_base = cell_idx * 32;

            let current_count = self.matrix.spatial_grid[sg_base];
            let next_slot = current_count + 1;

            if next_slot <= max_atom_slots {
                self.matrix.spatial_grid[sg_base] = next_slot;
                // Store atom index in the grid slot
                self.matrix.spatial_grid[sg_base + (next_slot as usize)] = idx as i32;

                // Accumulate Phase into slot 31 (cell_capacity)
                let my_phase = self.matrix.phase[idx] as i32;
                self.matrix.spatial_grid[sg_base + (cell_capacity as usize)] += my_phase;

                // Role quorum counting
                let role = self.matrix.roles[idx];
                let safe_role = if role > 7 { 7 } else { role as usize };

                let q_base = cell_idx * 8;
                self.matrix.quorum[q_base + safe_role] += 1;

                if next_slot > max_cell_count {
                    max_cell_count = next_slot;
                }
            } else {
                overflow_count += 1;
            }
        }

        // 3. Finalize Phase Averages
        for i in 0..total_cells {
            let sg_base = i * 32;
            let count = self.matrix.spatial_grid[sg_base];
            if count > 0 {
                let sum = self.matrix.spatial_grid[sg_base + (cell_capacity as usize)];
                self.matrix.spatial_grid[sg_base + (cell_capacity as usize)] = sum / count;
            }
        }

        (overflow_count, max_cell_count)
    }

    /// Helper to get number of atoms in a specific grid cell
    pub fn get_spatial_grid_count(&self, gx: i32, gy: i32) -> i32 {
        let cell_idx = (gy * 140 + gx) as usize;
        self.matrix.spatial_grid[cell_idx * 32]
    }

    /// Helper to get a specific atom index from a grid cell
    pub fn get_spatial_grid_atom(&self, gx: i32, gy: i32, sub_idx: i32) -> i32 {
        let cell_idx = (gy * 140 + gx) as usize;
        self.matrix.spatial_grid[cell_idx * 32 + ((sub_idx + 1) as usize)]
    }
}
