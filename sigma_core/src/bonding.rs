//! Symbiotic Bonding Engine
//! Manages Tensegrity networks through queued `bond_requests` arrays resolved per-tick.

use crate::memory::{SigmaState, MAX_ATOMS};

impl SigmaState {
    /// Attempts to establish a bond by pushing a request to the `bond_requests` array.
    pub fn push_bond_request(
        &mut self,
        request_idx: usize,
        initiator_idx: usize,
        target_idx: usize,
    ) {
        if request_idx >= MAX_ATOMS {
            return;
        }

        let ptr = request_idx * 3;

        // Only push if the slot is empty (status == 0)
        if self.matrix.bond_requests[ptr + 2] == 0 {
            // we use 1-indexed to avoid 0 clashes
            self.matrix.bond_requests[ptr] = (initiator_idx as i32) + 1;
            self.matrix.bond_requests[ptr + 1] = (target_idx as i32) + 1;
            self.matrix.bond_requests[ptr + 2] = 1; // 1 = PENDING
        }
    }

    /// Evaluates bonding intent mapped during the frame.
    /// Returns the number of successful bonds established.
    pub fn resolve_bond_requests(&mut self) -> i32 {
        let mut resolved = 0;

        for i in 0..MAX_ATOMS {
            let ptr = i * 3;
            let status = self.matrix.bond_requests[ptr + 2];

            if status != 1 {
                // Not active PENDING
                self.matrix.bond_requests[ptr] = 0;
                continue;
            }

            let initiator_plus1 = self.matrix.bond_requests[ptr];
            let target_plus1 = self.matrix.bond_requests[ptr + 1];

            let initiator = (initiator_plus1 - 1) as usize;
            let target = (target_plus1 - 1) as usize;

            if target > 0 && target < MAX_ATOMS {
                // Must ensure atom target still alive
                if self.matrix.ids[target] != 0 {
                    // Set Bond on Initiator's first slot (for simplicity, we mimic deterministic slot 0/1 logic here)
                    // Deno uses setBondTarget(init, 0), setBondTarget(target, 1) mapping.
                    self.matrix.bonds[(initiator * 4) + 0] = target as i32;
                    self.matrix.stiffness[(initiator * 4) + 0] = 0.1;

                    self.matrix.bonds[(target * 4) + 1] = initiator as i32;
                    self.matrix.stiffness[(target * 4) + 1] = 0.1;

                    resolved += 1;
                }
            }

            // Clear request
            self.matrix.bond_requests[ptr] = 0;
            self.matrix.bond_requests[ptr + 1] = 0;
            self.matrix.bond_requests[ptr + 2] = 0;
        }

        resolved
    }
}
