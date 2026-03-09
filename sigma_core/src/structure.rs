//! Architecture Intent Engine
//! Handles the arbitration and locking mechanisms for `OP_BUILD`, `OP_PLUG`, and `OP_SENSE`.

use crate::memory::SigmaState;

pub const STRUCTURE_INTENT_LOCK_BIT: i32 = -2147483648; // 0x80000000

impl SigmaState {
    /// Attempts to publish a build intent to the specified cell.
    /// Arbitration happens via the `ownerToken` mechanism to resolve racing logic during a tick.
    pub fn publish_build_intent(
        &mut self,
        cell_idx: usize,
        owner_atom_idx: usize,
        build_value: i32,
    ) {
        if cell_idx >= crate::memory::GRID_CELLS {
            return;
        }

        let current_owner = self.matrix.structure_build_owner[cell_idx];

        // Bail if locked by the consensus daemon
        if current_owner == STRUCTURE_INTENT_LOCK_BIT {
            return;
        }

        let owner_token = (owner_atom_idx as i32) + 1; // 1-indexed

        if owner_token > current_owner {
            self.matrix.structure_build_owner[cell_idx] = owner_token;
            self.matrix.structure_build_value[cell_idx] = build_value;
        }
    }

    /// Reads the state of a structure cell, viewing the immediate intent if present,
    /// otherwise returning the finalized grid value.
    pub fn read_structure_cell(&self, cell_idx: usize) -> i32 {
        if cell_idx >= crate::memory::GRID_CELLS {
            return 0;
        }

        let intent_owner = self.matrix.structure_build_owner[cell_idx];
        if intent_owner != 0 && intent_owner != STRUCTURE_INTENT_LOCK_BIT {
            self.matrix.structure_build_value[cell_idx]
        } else {
            self.matrix.structure_grid[cell_idx]
        }
    }

    /// Mutates the charge intent for OP_PLUG.
    pub fn set_structure_charge_intent(&mut self, cell_idx: usize, charge: i32) {
        if cell_idx < crate::memory::GRID_CELLS {
            self.matrix.structure_charge_intent[cell_idx] = charge;
        }
    }
}
