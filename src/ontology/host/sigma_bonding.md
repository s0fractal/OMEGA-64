---
id: sigma_bonding
type: substrate_module
target: rust
deps:
  - SYSTEM_CONSTANTS
  - SYSTEM_CONSTANTS
  - sigma_memory
description: Solves simultaneous structural bonding intents using spatial hashes
---

# `Bonding Engine`

```rust
// Symbiotic Bonding Engine
// Manages Tensegrity networks through queued `bond_requests` arrays resolved per-tick.

use crate::{SigmaState, MAX_ATOMS};

impl SigmaState {
    /// Attempts to establish a bond by pushing a request to the `bond_requests` array.
    pub fn push_bond_request(&self, request_idx: usize, initiator_idx: usize, target_idx: usize) {
        if request_idx >= MAX_ATOMS {
            return;
        }

        let ptr = request_idx * 3;
        let bond_atomic = self.bond_requests_atomic();

        // We use the status field (ptr + 2) as our primary lock point. 0 = IDLE, 1 = PENDING.
        // Atoms trying to bind to the same request slot concurrently will race here.
        if bond_atomic[ptr + 2]
            .compare_exchange(
                0,
                1, // Reserve slot as PENDING
                std::sync::atomic::Ordering::AcqRel,
                std::sync::atomic::Ordering::Acquire,
            )
            .is_ok()
        {
            // Successfully claimed the slot. Now we can safely load the data payload.
            // Initiator/Target writes don't need fetch_add since they are protected by the acquired status lock.
            bond_atomic[ptr].store(
                (initiator_idx as i32) + 1,
                std::sync::atomic::Ordering::Release,
            );
            bond_atomic[ptr + 1].store(
                (target_idx as i32) + 1,
                std::sync::atomic::Ordering::Release,
            );
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

            if initiator >= MAX_ATOMS || target >= MAX_ATOMS {
                self.matrix.bond_requests[ptr] = 0;
                self.matrix.bond_requests[ptr + 1] = 0;
                self.matrix.bond_requests[ptr + 2] = 0;
                continue;
            }

            if target > 0 {
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
```
