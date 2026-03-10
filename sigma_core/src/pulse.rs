use crate::memory::MAX_ATOMS;
use crate::{LambdaVM, SigmaState};

pub struct PulseOrchestrator {
    vm: LambdaVM,
}

impl Default for PulseOrchestrator {
    fn default() -> Self {
        Self::new()
    }
}

impl PulseOrchestrator {
    pub fn new() -> Self {
        Self {
            vm: LambdaVM::new(),
        }
    }

    pub fn tick(&mut self, state: &mut SigmaState, tick_number: u32) {
        state.matrix.tick_counter = tick_number as i32;

        // 1. Spatial Hash
        state.build_spatial_hash();

        // 2. Sync Read Views (Double Buffering)
        state
            .matrix
            .physics_read_xs
            .copy_from_slice(&state.matrix.xs);
        state
            .matrix
            .physics_read_ys
            .copy_from_slice(&state.matrix.ys);
        state
            .matrix
            .physics_read_energy
            .copy_from_slice(&state.matrix.energy);
        state
            .matrix
            .physics_read_resonance
            .copy_from_slice(&state.matrix.resonance);

        // 3. Execution Phase
        for i in 1..MAX_ATOMS {
            if state.matrix.ids[i] != 0 {
                self.vm.step(state, i);
            }
        }

        // 4. Resolution Phase
        state.resolve_bond_requests();
        let _ = state.drain_spawn_requests(tick_number as i32);

        // 5. Environment Phase
        crate::environment::tick_glyph_transport(state);
        crate::environment::tick_structure_grid(state);

        // 6. Metabolism Phase & 7. Immune Phase (GC)
        let base_entropy_tax = 10;
        let base_friction = 5;

        for i in 1..MAX_ATOMS {
            if state.matrix.ids[i] != 0 {
                let mut e = state.matrix.energy[i];
                e -= base_entropy_tax;
                e -= base_friction;

                if e <= 0 {
                    state.recycle_atom(i);
                } else {
                    state.matrix.energy[i] = e;
                }
            }
        }
    }
}
