// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/sigma_pulse.md
// Substrate Node: sigma_pulse
// Level: 4
// Multithreaded tick orchestrator and phase sequencer using Rayon

#![allow(unused_imports)]
use super::super::L03::*;

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
            .matrix
            .physics_read_xs
            .copy_from_slice(&state.matrix.xs);
            .matrix
            .physics_read_ys
            .copy_from_slice(&state.matrix.ys);
            .matrix
            .physics_read_energy
            .copy_from_slice(&state.matrix.energy);
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

        use std::collections::VecDeque;

        // Process all atoms to clear old flags and evolve roles
        for i in 0..MAX_ATOMS {
            if state.matrix.ids[i] != 0 {
                // Resonance Protocol: Guardian -> Architect transition on low coherence
                let role = state.matrix.roles[i] & 0x7F;
                let coherence = state.matrix.neural_coherence;
                if role == 2 && coherence < 100 {
                    state.matrix.roles[i] = (state.matrix.roles[i] & 0x80) | 3;
                }

                state.matrix.roles[i] &= !0x80; // Clear metazoan flag for refresh
                state.matrix.evolution_reserved[i] = 0;
            }
        }

        // BFS-based Connected Component Detection
        let mut tissues: Vec<Vec<usize>> = Vec::new();

        for start_node in 1..MAX_ATOMS {
            if state.matrix.ids[start_node] == 0 || self.visited[start_node] == 1 {
                continue;
            }

            // Start a new component traversal
            let mut component = Vec::new();
            let mut queue = VecDeque::new();
            queue.push_back(start_node);
            self.visited[start_node] = 1;

            while let Some(current) = queue.pop_front() {
                component.push(current);

                for b_slot in 0..4 {
                    let target = state.matrix.bonds[(current * 4) + b_slot] as usize;
                    if target > 0 && target < MAX_ATOMS && state.matrix.ids[target] != 0 {
                        if self.visited[target] == 0 {
                            self.visited[target] = 1;
                            queue.push_back(target);
                        }
                    }
                }
            }

            // A Tissue is a connected component with >= 3 atoms (minimum for a loop)
            // Note: For absolute strictness, we'd check for a cycle, but in Era 69, 
            // any stable bond-cluster is treated as proto-tissue.
            if component.len() >= 3 {
                tissues.push(component);
            }
        }

        // Apply Tissue-level Physical Laws
        for tissue in &tissues {
            let count = tissue.len() as i64;
            let mut sum_energy: i64 = 0;
            let mut sum_resonance: i64 = 0;
            let mut total_dx = 0i32;
            let mut total_dy = 0i32;
            let mut architect_count = 0;

            // First pass: Calculate pooling metrics and count internal bonds
            for &node in tissue {
                sum_energy += state.matrix.energy[node] as i64;
                sum_resonance += state.matrix.resonance[node] as i64;
                
                // Count internal bonds (bonds within the same tissue)
                let mut internal_bonds = 0;
                for b_slot in 0..4 {
                    let target = state.matrix.bonds[(node * 4) + b_slot] as usize;
                    if target > 0 && target < MAX_ATOMS && tissue.contains(&target) {
                        internal_bonds += 1;
                    }
                }

                // EPIGENETIC DIFFERENTIATION
                // Surface (< 3 bonds) -> ROLE_GUARDIAN (2)
                // Core (3-4 bonds) -> ROLE_ARCHITECT (3)
                if internal_bonds < 3 {
                    state.matrix.roles[node] = (state.matrix.roles[node] & 0x80) | 2;
                } else {
                    state.matrix.roles[node] = (state.matrix.roles[node] & 0x80) | 3;
                    
                    // COHESIVE MOVEMENT: Capture movement from Core (Architect) atoms
                    let dx = (state.matrix.xs[node] - state.matrix.physics_read_xs[node]) as i32;
                    let dy = (state.matrix.ys[node] - state.matrix.physics_read_ys[node]) as i32;
                    if dx != 0 || dy != 0 {
                        total_dx += dx;
                        total_dy += dy;
                        architect_count += 1;
                    }
                }
                
                state.matrix.roles[node] |= 0x80; // Set Metazoan Flag
            }

            // Apply Resource Pooling (Averaging)
            let avg_energy = (sum_energy / count) as i32;
            let avg_resonance = (sum_resonance / count) as i32;

            // Apply Cohesive Movement (Translate entire tissue based on Core delta)
            let (final_dx, final_dy) = if architect_count > 0 {
                (total_dx / architect_count, total_dy / architect_count)
            } else {
                (0, 0)
            };

            for &node in tissue {
                state.matrix.energy[node] = avg_energy;
                state.matrix.resonance[node] = avg_resonance;
                state.matrix.evolution_reserved[node] = sum_resonance as i32; // Shielding

                if (final_dx != 0 || final_dy != 0) && (state.matrix.roles[node] & 0x7F) != 3 {
                    // Apply translation to Guardians to match the Architect's move
                    state.matrix.xs[node] = (state.matrix.physics_read_xs[node] as i32 + final_dx) as i16;
                    state.matrix.ys[node] = (state.matrix.physics_read_ys[node] as i32 + final_dy) as i16;
                }
            }
        }
    }
}