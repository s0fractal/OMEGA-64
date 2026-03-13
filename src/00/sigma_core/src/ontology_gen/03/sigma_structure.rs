// Substrate Node: sigma_structure
// Level: 3
// Handles the cellular automaton lifecycle of the crystalline grid

#[allow(unused_imports)]
use super::super::L02::*;

// Architecture Intent Engine
// Handles the arbitration and locking mechanisms for `OP_BUILD`, `OP_PLUG`, and `OP_SENSE`.

use crate::SigmaState;

pub const STRUCTURE_INTENT_LOCK_BIT: i32 = -2147483648; // 0x80000000

impl SigmaState {
    /// Attempts to publish a build intent to the specified cell.
    /// Attempts to publish a build intent to the specified cell.
    /// Arbitration happens via the `ownerToken` mechanism to resolve racing logic during a tick.
    pub fn publish_build_intent(&self, cell_idx: usize, owner_atom_idx: usize, build_value: i32) {
        if cell_idx >= crate::GRID_CELLS {
            return;
        }

        let owner_atomic = self.structure_build_owner_atomic();
        let val_atomic = unsafe {
            std::slice::from_raw_parts(
                self.matrix.structure_build_value.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.structure_build_value.len(),
            )
        };

        let owner_token = (owner_atom_idx as i32) + 1; // 1-indexed

        // Spin until we successfully lock or realize we are over-prioritized
        loop {
            let current_owner = owner_atomic[cell_idx].load(std::sync::atomic::Ordering::Acquire);

            // Bail if locked by the consensus daemon
            if current_owner == STRUCTURE_INTENT_LOCK_BIT {
                break;
            }

            if owner_token > current_owner {
                // We have higher priority, attempt to claim it
                match owner_atomic[cell_idx].compare_exchange(
                    current_owner,
                    owner_token,
                    std::sync::atomic::Ordering::AcqRel,
                    std::sync::atomic::Ordering::Acquire,
                ) {
                    Ok(_) => {
                        // Success! We claimed the owner token. Write our value.
                        val_atomic[cell_idx]
                            .store(build_value, std::sync::atomic::Ordering::Release);
                        break;
                    }
                    Err(_) => {
                        // Failed to claim (another atom snuck in). Loop again and re-evaluate `current_owner`.
                        continue;
                    }
                }
            } else {
                // An atom with higher priority already owns this slot for this tick.
                break;
            }
        }
    }

    /// Reads the state of a structure cell, viewing the immediate intent if present,
    /// otherwise returning the finalized grid value.
    pub fn read_structure_cell(&self, cell_idx: usize) -> i32 {
        if cell_idx >= crate::GRID_CELLS {
            return 0;
        }

        let owner_atomic = self.structure_build_owner_atomic();
        let intent_owner = owner_atomic[cell_idx].load(std::sync::atomic::Ordering::Acquire);

        if intent_owner != 0 && intent_owner != STRUCTURE_INTENT_LOCK_BIT {
            let val_atomic = unsafe {
                std::slice::from_raw_parts(
                    self.matrix.structure_build_value.as_ptr()
                        as *const std::sync::atomic::AtomicI32,
                    self.matrix.structure_build_value.len(),
                )
            };
            val_atomic[cell_idx].load(std::sync::atomic::Ordering::Acquire)
        } else {
            self.matrix.structure_grid[cell_idx]
        }
    }

    /// Mutates the charge intent for OP_PLUG.
    pub fn set_structure_charge_intent(&self, cell_idx: usize, charge: i32) {
        if cell_idx < crate::GRID_CELLS {
            let intent_atomic = self.structure_charge_intent_atomic();
            let mut current = intent_atomic[cell_idx].load(std::sync::atomic::Ordering::Acquire);
            loop {
                // In Deno, multiple plugs into the same cell don't sum, they take max, or they just overwrite.
                // Assuming overwrite or max. Max is safer for multi-threaded:
                if charge <= current {
                    break;
                }
                match intent_atomic[cell_idx].compare_exchange(
                    current,
                    charge,
                    std::sync::atomic::Ordering::AcqRel,
                    std::sync::atomic::Ordering::Acquire,
                ) {
                    Ok(_) => break,
                    Err(actual) => current = actual,
                }
            }
        }
    }
}