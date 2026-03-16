---
id: sigma_pulse
type: substrate_module
target: rust
deps:
  - SYSTEM_CONSTANTS
  - SYSTEM_CONSTANTS
  - sigma_memory
  - apply_metabolism_kernel
description: Multithreaded tick orchestrator and phase sequencer using Rayon
---

# `PulseOrchestrator` implementation

```rust
use crate::{GRID_H, GRID_W, MAX_ATOMS};
use crate::{LambdaVM, SigmaState};
use rayon::prelude::*;

pub struct PulseOrchestrator<'a> {
    pub visited: &'a mut [u8],
}

impl<'a> PulseOrchestrator<'a> {
    pub fn new(buffer: &'a mut [u8]) -> Self {
        Self { visited: buffer }
    }
    pub fn tick(&mut self, state: &mut SigmaState, tick_number: u32) {
        // 0. Metabolism Phase (Resonant Autonomy)
        
        // --- Metabolism Reduction (Population Counting) ---
        // Reset scratch space and count populations
        let scratch_ptr = unsafe { (&mut *state.matrix as *mut crate::SigmaMatrix as *mut u8).add(crate::METABOLISM_SCRATCH_OFFSET) as *mut i32 };
        unsafe { std::ptr::write_bytes(scratch_ptr, 0, (65536 * 4) + 128); }
        
        let mut total_pop = 0;
        for i in 0..MAX_ATOMS {
            if state.matrix.ids[i] != 0 {
                total_pop += 1;
                let key = crate::genome_key16(state, i as i32);
                unsafe {
                    let genome_count_ptr = scratch_ptr.add(key as usize);
                    *genome_count_ptr += 1;
                }
            }
        }
        unsafe {
            let population_ptr = scratch_ptr.add(65536);
            *population_ptr = total_pop;
        }

        // Hardcoded parity with RUNTIME_POLICY defaults for now
        apply_metabolism_kernel(
            state,
            0,
            MAX_ATOMS as i32,
            0,
            0,
            2,
            1200,
            240,
            12,
            5,
            20,
            200,
            0,
        );

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

        // 3. Execution Phase (Parallelizing over all logical atom indices)
        (0..MAX_ATOMS).for_each(|i| {
            if state.matrix.ids[i] != 0 {
                let mut mass = 1;
                for b_slot in 0..4 {
                    let bond_idx = (i * 4) + b_slot;
                    let target = state.matrix.bonds[bond_idx];
                    if target > 0
                        && (target as usize) < MAX_ATOMS
                        && state.matrix.ids[target as usize] != 0
                    {
                        mass += 1;
                    }
                }

                if tick_number % mass == 0 {
                    let mut vm = LambdaVM::new(); // VM has no deep state, very cheap to allocate
                    vm.step(state, i);
                }
            }
        });

        // 4. Resolution Phase
        state.resolve_bond_requests();
        let _ = state.drain_spawn_requests(tick_number as i32);

        // 5. Environment Phase
        crate::tick_glyph_transport(state);
        crate::tick_structure_grid(state);

        // 8. Membrane Physics (Metazoan Emergence)
        self.visited.fill(0);

        for i in 0..MAX_ATOMS {
            if state.matrix.ids[i] != 0 {
                // Resonance Protocol: Guardian -> Architect transition on low coherence
                let role = state.matrix.roles[i] & 0x7F;
                let coherence = state.matrix.neural_coherence;
                if role == 2 && coherence < 100 {
                    state.matrix.roles[i] = (state.matrix.roles[i] & 0x80) | 3;
                }

                state.matrix.roles[i] &= !0x80;
                state.matrix.evolution_reserved[i] = 0;
            }
        }

        let mut rings: Vec<Vec<usize>> = Vec::new();

        // Detect simple topological cycles (length 3 to 8)
        for start_node in 0..MAX_ATOMS {
            if state.matrix.ids[start_node] == 0 || self.visited[start_node] == 1 {
                continue;
            }

            let mut path = Vec::with_capacity(8);
            path.push(start_node);

            fn dfs(
                current: usize,
                start: usize,
                depth: usize,
                path: &mut Vec<usize>,
                state: &SigmaState,
            ) -> bool {
                if depth >= 8 {
                    return false;
                }

                for b_slot in 0..4 {
                    let target = state.matrix.bonds[(current * 4) + b_slot] as usize;
                    if target > 0 && target < MAX_ATOMS && state.matrix.ids[target] != 0 {
                        if target == start && depth >= 2 {
                            return true;
                        }
                        // Prune duplicate or overlapping loops natively
                        if target < start {
                            continue;
                        }
                        if !path.contains(&target) {
                            path.push(target);
                            if dfs(target, start, depth + 1, path, state) {
                                return true;
                            }
                            path.pop();
                        }
                    }
                }
                false
            }

            if dfs(start_node, start_node, 0, &mut path, &*state) {
                rings.push(path.clone());
                for &node in &path {
                    self.visited[node] = 1;
                }
            }
        }

        // Resource Pooling and Stealth Flagging
        for ring in &rings {
            let count = ring.len() as i32;
            let mut sum_energy: i64 = 0;
            let mut sum_resonance: i64 = 0;

            for &node in ring {
                sum_energy += state.matrix.energy[node] as i64;
                sum_resonance += state.matrix.resonance[node] as i64;
                state.matrix.roles[node] |= crate::AtomRole::MetazoanFlag as u8;
                // Metazoan flag
            }

            let avg_energy = (sum_energy / count as i64) as i32;
            let avg_resonance = (sum_resonance / count as i64) as i32;
            let total_resonance = sum_resonance as i32; // Shield Defense

            for &node in ring {
                state.matrix.energy[node] = avg_energy;
                state.matrix.resonance[node] = avg_resonance;
                state.matrix.evolution_reserved[node] = total_resonance;
            }
        }
    }
}
```
