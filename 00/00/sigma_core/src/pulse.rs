use crate::constants::MAX_ATOMS;
use crate::{LambdaVM, SigmaState};

pub struct PulseOrchestrator<'a> {
    pub visited: &'a mut [u8],
}

impl<'a> PulseOrchestrator<'a> {
    pub fn new(buffer: &'a mut [u8]) -> Self {
        Self { visited: buffer }
    }

    pub fn tick(&mut self, state: &mut SigmaState, tick_number: u32) {
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
        (1..MAX_ATOMS).for_each(|i| {
            if state.matrix.ids[i] != 0 {
                let mut mass = 1;
                for b_slot in 0..4 {
                    let bond_idx = (i * 4) + b_slot;
                    let target = state.matrix.bonds[bond_idx];
                    if target > 0 && (target as usize) < MAX_ATOMS && state.matrix.ids[target as usize] != 0 {
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
        crate::environment::tick_glyph_transport(state);
        crate::environment::tick_structure_grid(state);

        // 6. Metabolism Phase & 7. Immune Phase (GC)
        let base_entropy_tax = 10;
        let base_friction = 5;

        for i in 1..MAX_ATOMS {
            if state.matrix.ids[i] != 0 {
                let role = state.matrix.roles[i] & 0x7F;
                
                let mut e = state.matrix.energy[i];

                if role == 5 { // ROLE_MITOCHONDRIA
                    let host_idx = state.matrix.context[i][12] as usize;
                    if host_idx > 0 && host_idx < MAX_ATOMS && state.matrix.ids[host_idx] != 0 {
                        // Enforce Coordinate Lock
                        state.matrix.xs[i] = state.matrix.xs[host_idx];
                        state.matrix.ys[i] = state.matrix.ys[host_idx];
                        
                        // Pay up 90% of current energy
                        if e > crate::constants::ENERGY_SCALE {
                            let transfer = ((e - crate::constants::ENERGY_SCALE) as f64 * 0.9) as i32;
                            if transfer > 0 {
                                state.matrix.energy[host_idx] += transfer;
                                e -= transfer;
                            }
                        }
                        state.matrix.energy[i] = e;
                    } else {
                        // Host died
                        state.matrix.energy[i] = 0;
                        state.matrix.ids[i] = 0;
                        state.matrix.roles[i] = 0;
                    }
                    continue;
                }

                let mut mass = 1;
                for b_slot in 0..4 {
                    let bond_idx = (i * 4) + b_slot;
                    let target = state.matrix.bonds[bond_idx];
                    if target > 0 && (target as usize) < MAX_ATOMS && state.matrix.ids[target as usize] != 0 {
                        mass += 1;
                    }
                }

                let effective_tax = base_entropy_tax / mass;
                
                e -= effective_tax;
                e -= base_friction; // Friction remains constant for mechanical movement parity

                if e <= 0 {
                    // PH 43: Fossilization Check 
                    let resonance = state.matrix.resonance[i];
                    let role = state.matrix.roles[i] & 0x7F; // Strip metazoan flag
                    let has_immunity = state.matrix.context[i][13] != 0 || state.matrix.context[i][14] != 0;
                    
                    if resonance > 100 || role == 2 || role == 3 || mass > 2 || has_immunity {
                        let cx = state.matrix.xs[i] as usize;
                        let cy = state.matrix.ys[i] as usize;
                        let gx = cx / (crate::constants::ENERGY_SCALE as usize);
                        let gy = cy / (crate::constants::ENERGY_SCALE as usize);
                        
                        if gx < 140 && gy < 80 {
                            let cell_idx = gy * 140 + gx;
                            let structure_val = state.matrix.structure_grid[cell_idx];
                            let structure_type = structure_val & 0xFF;
                            
                            // 1. Structural Crystallization
                            if structure_type == 0 || structure_type == 1 {
                                let mut charge = resonance.clamp(10, 255);
                                let base_charge = (structure_val >> 16) & 0xFF;
                                charge = std::cmp::max(charge, base_charge);
                                
                                let new_type = if role == 3 {
                                    6 // STR_CAPACITOR (Architects leave energy banks)
                                } else {
                                    1 // STR_WIRE (Guardians and others leave hardened walls/pathways)
                                };
                                
                                state.matrix.structure_grid[cell_idx] = new_type | (charge << 16);
                            }
                            
                            // 2. Epigenetic Hash Trace (CRISPR memory spill)
                            let mut scroll_hash = state.matrix.context[i][13];
                            if scroll_hash == 0 {
                                scroll_hash = state.matrix.context[i][14];
                            }
                            
                            if scroll_hash != 0 {
                                let mut mem = state.matrix.memory_grid[cell_idx];
                                
                                // To organically decay into a kind=2 plasmid via tick_glyph_transport,
                                // memory_grid triggers off of the first 3-bytes being a 24-bit charge >= 1.
                                // We'll put the scroll into the 4 upper bytes (4..8) as payload,
                                // and set the first byte to a minimal charge trigger if not already charged.
                                mem[4] = ((scroll_hash >> 24) & 0xFF) as u8;
                                mem[5] = ((scroll_hash >> 16) & 0xFF) as u8;
                                mem[6] = ((scroll_hash >> 8) & 0xFF) as u8;
                                mem[7] = (scroll_hash & 0xFF) as u8;
                                
                                // memory_lo triggers charge. 
                                let memory_lo = u32::from_le_bytes([mem[0], mem[1], mem[2], mem[3]]);
                                let mut charge = (memory_lo & 0xFFFFFF) as i32;
                                if charge < 100 {
                                    charge = 100; // Provide enough plasma generic charge to bleed off into a kind=2
                                    mem[0] = (charge & 0xFF) as u8;
                                    mem[1] = ((charge >> 8) & 0xFF) as u8;
                                    mem[2] = ((charge >> 16) & 0xFF) as u8;
                                    // keep mem[3] unaltered
                                }
                                
                                state.matrix.memory_grid[cell_idx] = mem;
                            }
                        }
                    }

                    state.recycle_atom(i);
                } else {
                    state.matrix.energy[i] = e;
                }
            }
        }

        // 8. Membrane Physics (Metazoan Emergence)
        self.visited.fill(0);
        
        for i in 1..MAX_ATOMS {
            if state.matrix.ids[i] != 0 {
                state.matrix.roles[i] &= !0x80;
                state.matrix.evolution_reserved[i] = 0;
            }
        }

        let mut rings: Vec<Vec<usize>> = Vec::new();

        // Detect simple topological cycles (length 3 to 8)
        for start_node in 1..MAX_ATOMS {
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
                state.matrix.roles[node] |= crate::constants::AtomRole::MetazoanFlag as u8; // Metazoan flag
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
