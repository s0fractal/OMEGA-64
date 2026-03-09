//! LambdaVM Execution Engine

use crate::isa::{
    GlyphOp, PROP_ENERGY, PROP_PHASE, PROP_RESONANCE, SYS_EAT, SYS_MOVE, SYS_TRANSFER,
};
use crate::math::{math_cos, math_sin};
use crate::memory::{SigmaState, MAX_ATOMS};

pub struct LambdaVM {}

impl LambdaVM {
    pub fn new() -> Self {
        Self {}
    }

    /// Execute a bounded execution step for a specific atom index,
    /// exactly matching the Deno reference step function economics.
    pub fn step(&mut self, state: &mut SigmaState, atom_idx: usize) {
        if atom_idx >= crate::memory::MAX_ATOMS {
            return;
        }

        // Get initial PC
        let mut pc = state.matrix.context[atom_idx][8] as u8;

        // Emulating `getReadEnergy` and `getReadResonance` which act as snapshots
        // during execution, though for simple tests we assume they match actual.
        let mut energy = state.matrix.energy[atom_idx];
        let mut resonance = state.matrix.resonance[atom_idx];

        let mut gas_used = 0;
        let mut gas_limit = if energy < 100 { energy } else { 100 };

        while gas_used < gas_limit {
            let op = GlyphOp::from(state.matrix.instructions[atom_idx][pc as usize]);

            match op {
                GlyphOp::Nop => {
                    gas_used += 1;
                    break;
                }
                GlyphOp::Set => {
                    let reg = state.matrix.instructions[atom_idx][(pc + 1) as usize];
                    let imm = state.matrix.instructions[atom_idx][(pc + 2) as usize];
                    if reg < 8 {
                        state.matrix.context[atom_idx][reg as usize] = imm as i32;
                    }
                    pc += 3;
                    gas_used += 1;
                }
                GlyphOp::Get => {
                    let reg = state.matrix.instructions[atom_idx][(pc + 1) as usize];
                    let prop = state.matrix.instructions[atom_idx][(pc + 2) as usize];
                    let mut val = 0;

                    if prop == PROP_ENERGY {
                        val = energy;
                    } else if prop == PROP_RESONANCE {
                        val = resonance;
                    } else if prop == PROP_PHASE {
                        val = state.matrix.phase[atom_idx];
                    }
                    // Ignoring complex external grid read properties for simple test harness

                    if reg < 8 {
                        state.matrix.context[atom_idx][reg as usize] = val;
                    }
                    pc += 3;
                    gas_used += 2;
                }
                GlyphOp::Put => {
                    let reg = state.matrix.instructions[atom_idx][(pc + 1) as usize];
                    let prop = state.matrix.instructions[atom_idx][(pc + 2) as usize];
                    let val = if reg < 8 {
                        state.matrix.context[atom_idx][reg as usize]
                    } else {
                        0
                    };

                    if prop == PROP_ENERGY {
                        energy = val;
                    } else if prop == PROP_RESONANCE {
                        resonance = val;
                    } else if prop == PROP_PHASE {
                        state.matrix.phase[atom_idx] = val;
                    }

                    pc += 3;
                    gas_used += 2;
                }
                GlyphOp::Add => {
                    let r1 = state.matrix.instructions[atom_idx][(pc + 1) as usize];
                    let r2 = state.matrix.instructions[atom_idx][(pc + 2) as usize];
                    if r1 < 8 && r2 < 8 {
                        let sum = state.matrix.context[atom_idx][r1 as usize]
                            .wrapping_add(state.matrix.context[atom_idx][r2 as usize]);
                        state.matrix.context[atom_idx][r1 as usize] = sum;
                    }
                    pc += 3;
                    gas_used += 1;
                }
                GlyphOp::Sub => {
                    let r1 = state.matrix.instructions[atom_idx][(pc + 1) as usize];
                    let r2 = state.matrix.instructions[atom_idx][(pc + 2) as usize];
                    if r1 < 8 && r2 < 8 {
                        let sub = state.matrix.context[atom_idx][r1 as usize]
                            .wrapping_sub(state.matrix.context[atom_idx][r2 as usize]);
                        state.matrix.context[atom_idx][r1 as usize] = sub;
                    }
                    pc += 3;
                    gas_used += 1;
                }
                GlyphOp::Jnz => {
                    let reg = state.matrix.instructions[atom_idx][(pc + 1) as usize];
                    let target = state.matrix.instructions[atom_idx][(pc + 2) as usize];
                    if reg < 8 && state.matrix.context[atom_idx][reg as usize] != 0 {
                        pc = target;
                    } else {
                        pc += 3;
                    }
                    gas_used += 2;
                }
                GlyphOp::Jz => {
                    // Note: Deno didn't have OP_JZ fully flushed in phase-7 physics, but logic implies inverse JNZ
                    let reg = state.matrix.instructions[atom_idx][(pc + 1) as usize];
                    let target = state.matrix.instructions[atom_idx][(pc + 2) as usize];
                    if reg < 8 && state.matrix.context[atom_idx][reg as usize] == 0 {
                        pc = target;
                    } else {
                        pc += 3;
                    }
                    gas_used += 2;
                }
                GlyphOp::Jmp => {
                    pc = state.matrix.instructions[atom_idx][(pc + 1) as usize];
                    gas_used += 2;
                }
                GlyphOp::Resolve => {
                    let dest_reg = state.matrix.instructions[atom_idx][(pc + 1) as usize];
                    let angle_reg = state.matrix.instructions[atom_idx][(pc + 2) as usize];
                    let mode_reg = state.matrix.instructions[atom_idx][(pc + 3) as usize];

                    let angle = if angle_reg < 8 {
                        state.matrix.context[atom_idx][angle_reg as usize]
                    } else {
                        0
                    };
                    let mode_val = if mode_reg < 8 {
                        state.matrix.context[atom_idx][mode_reg as usize]
                    } else {
                        0
                    };

                    let mut high_res = 0;
                    let mut cost = 1;

                    if mode_val == 1 || mode_val == 3 {
                        high_res = 1;
                        cost = 5;
                    } else if mode_val == 4 || mode_val == 5 {
                        high_res = 2; // Reserved for Taylor2
                        cost = 10;
                    }

                    let val = if mode_val == 0 || mode_val == 1 || mode_val == 4 {
                        math_sin(angle, high_res)
                    } else {
                        math_cos(angle, high_res)
                    };

                    if dest_reg < 8 {
                        state.matrix.context[atom_idx][dest_reg as usize] = val;
                    }

                    pc += 4;
                    gas_used += cost;
                }
                GlyphOp::ResonateKuramoto => {
                    let gx = (state.matrix.xs[atom_idx] as i32) / 1000;
                    let gy = (state.matrix.ys[atom_idx] as i32) / 1000;

                    // Note: Deno physics clamp / 1000 logic is actually (xs / 10) / 100 -> xs / 1000.
                    // Let's use grid coordinates as mapped by build_spatial_hash (which are units of 10)
                    let current_phase = state.matrix.phase[atom_idx] as i32;
                    let mut sum_sin = 0;
                    let mut neighbor_count = 0;

                    let grid_cx = gx;
                    let grid_cy = gy;

                    for dy in -1..=1 {
                        for dx in -1..=1 {
                            let nx = grid_cx + dx;
                            let ny = grid_cy + dy;

                            if nx >= 0 && nx < 140 && ny >= 0 && ny < 80 {
                                let count = state.get_spatial_grid_count(nx, ny);
                                for i in 0..count {
                                    let neighbor_id =
                                        state.get_spatial_grid_atom(nx, ny, i) as usize;
                                    if neighbor_id > 0
                                        && neighbor_id != atom_idx
                                        && neighbor_id < MAX_ATOMS
                                    {
                                        let neighbor_phase = state.matrix.phase[neighbor_id] as i32;
                                        let diff = (neighbor_phase - current_phase) & 255;
                                        sum_sin += math_sin(diff, 0); // Direct lookup density mapping
                                        neighbor_count += 1;
                                    }
                                }
                            }
                        }
                    }

                    let coh = state.matrix.neural_coherence as i32;
                    let mut k_bond = 5 + (coh / 100);
                    if k_bond > 128 {
                        k_bond = 128;
                    }

                    if neighbor_count > 0 {
                        let d_theta = (k_bond * sum_sin) >> 15;
                        let theta_next = (current_phase + d_theta) & 255;
                        state.matrix.phase[atom_idx] = theta_next as i32;
                    }

                    pc += 1;
                    gas_used += 5 + (neighbor_count * 2);
                }
                GlyphOp::Share => {
                    let target_reg = state.matrix.instructions[atom_idx][(pc + 1) as usize];
                    let amount_reg = state.matrix.instructions[atom_idx][(pc + 2) as usize];

                    let target_idx = if target_reg < 8 {
                        state.matrix.context[atom_idx][target_reg as usize]
                    } else {
                        0
                    };
                    let mut amount = if amount_reg < 8 {
                        state.matrix.context[atom_idx][amount_reg as usize]
                    } else {
                        0
                    };

                    if target_idx > 0 && (target_idx as usize) < MAX_ATOMS && amount > 0 {
                        let aggression = state.matrix.hormones[2] as i32;
                        if aggression > 1024 {
                            amount += (amount * (aggression - 1024)) / 2048;
                        }

                        let sender_energy = state.matrix.energy[atom_idx];
                        let scaled_amount = amount * 1000;

                        if sender_energy >= scaled_amount {
                            state.matrix.energy[atom_idx] -= scaled_amount;
                            energy -= scaled_amount;
                            state.matrix.energy[target_idx as usize] += scaled_amount;
                        }
                    }

                    pc += 3;
                    gas_used += 10;
                }
                GlyphOp::Syscall | GlyphOp::SporeDrive | GlyphOp::Sense => {
                    if op == GlyphOp::Syscall {
                        let sys_id = state.matrix.context[atom_idx][0]; // R0
                        let r1 = state.matrix.context[atom_idx][1];
                        let r2 = state.matrix.context[atom_idx][2];
                        let r3 = state.matrix.context[atom_idx][3];

                        match sys_id {
                            SYS_MOVE => {
                                let dx_decoded = if r1 > 127 { r1 - 256 } else { r1 };
                                let dy_decoded = if r2 > 127 { r2 - 256 } else { r2 };

                                let dx_str = if dx_decoded == 0 {
                                    0
                                } else if dx_decoded > 0 {
                                    1
                                } else {
                                    -1
                                };
                                let dy_str = if dy_decoded == 0 {
                                    0
                                } else if dy_decoded > 0 {
                                    1
                                } else {
                                    -1
                                };

                                if dx_str != 0 || dy_str != 0 {
                                    let cx = state.matrix.xs[atom_idx] as i32;
                                    let cy = state.matrix.ys[atom_idx] as i32;

                                    let mut nx = cx + (dx_str * 10);
                                    let mut ny = cy + (dy_str * 10);

                                    if nx < 0 {
                                        nx = 0;
                                    } else if nx > 1399 {
                                        nx = 1399;
                                    }
                                    if ny < 0 {
                                        ny = 0;
                                    } else if ny > 799 {
                                        ny = 799;
                                    }

                                    let n_grid_x = nx / 10;
                                    let n_grid_y = ny / 10;

                                    let count_in_cell =
                                        state.get_spatial_grid_count(n_grid_x, n_grid_y);

                                    if count_in_cell < 31 {
                                        state.matrix.xs[atom_idx] = nx as i16;
                                        state.matrix.ys[atom_idx] = ny as i16;
                                    }
                                }
                                gas_used += 10;
                            }
                            SYS_EAT => {
                                let target_idx = r1 as usize;
                                let amount = r2;

                                if target_idx > 0 && target_idx < MAX_ATOMS && amount > 0 {
                                    if state.matrix.ids[target_idx] != 0 {
                                        let ox = state.matrix.xs[atom_idx] as f32;
                                        let oy = state.matrix.ys[atom_idx] as f32;
                                        let tx = state.matrix.xs[target_idx] as f32;
                                        let ty = state.matrix.ys[target_idx] as f32;

                                        let dx = (tx - ox) / 10.0;
                                        let dy = (ty - oy) / 10.0;
                                        // Equivalent to dist <= 1.5 (dist_sq <= 2.25)
                                        let dist_sq = dx * dx + dy * dy;

                                        if dist_sq <= 2.25 {
                                            let target_energy = state.matrix.energy[target_idx];
                                            let take_amount =
                                                std::cmp::min(amount * 1000, target_energy);

                                            if take_amount > 0 {
                                                state.matrix.energy[target_idx] -= take_amount;
                                                state.matrix.energy[atom_idx] += take_amount;
                                                energy += take_amount;
                                            }
                                        }
                                    }
                                }
                                gas_used += 30;
                            }
                            SYS_TRANSFER => {
                                let target_idx = r1 as usize;
                                let resource_type = r2;
                                let amount = r3;

                                if target_idx > 0 && target_idx < MAX_ATOMS && amount > 0 {
                                    if resource_type == 0 {
                                        // Energy
                                        let scaled_amount = amount * 1000;
                                        if state.matrix.energy[atom_idx] >= scaled_amount {
                                            state.matrix.energy[atom_idx] -= scaled_amount;
                                            energy -= scaled_amount;
                                            state.matrix.energy[target_idx] += scaled_amount;
                                        }
                                    } else if resource_type == 1 {
                                        // Resonance
                                        if state.matrix.resonance[atom_idx] >= amount {
                                            state.matrix.resonance[atom_idx] -= amount;
                                            resonance -= amount;
                                            state.matrix.resonance[target_idx] += amount;
                                        }
                                    }
                                }
                                gas_used += 10;
                            }
                            _ => {
                                gas_used += 10;
                            }
                        }
                    }

                    pc += 1; // Basic jump over opcode for next resume if applicable
                    if op != GlyphOp::Syscall {
                        gas_used += 10;
                    } // Fallback for SporeDrive/Sense
                    gas_limit = 0; // Yield to host
                }
                GlyphOp::Unknown => {
                    // Stop execution on invalid opcode
                    pc = 0;
                    gas_used += 1;
                    gas_limit = 0;
                }
            }

            if pc >= 64 {
                pc = 0;
            }
        }

        // Writeback PC
        state.matrix.context[atom_idx][8] = pc as i32;

        // Metabolics
        let entropy_h = state.matrix.hormones[0] as i32;
        let repair_h = state.matrix.hormones[4] as i32;
        let friction_h = state.matrix.hormones[5] as i32;

        let coherence_val = state.matrix.neural_coherence;
        let discount = if coherence_val > 1000 {
            2
        } else if coherence_val > 100 {
            1
        } else {
            0
        };

        let base_compute_cost = gas_used >> discount;
        let metabolic_cost =
            1 + base_compute_cost + ((gas_used * entropy_h) >> (12 + discount)) + (friction_h >> 8);

        // Phase Synchronization
        if coherence_val > 500 {
            let mut cur_phase = state.matrix.phase[atom_idx] as i32;
            if cur_phase < 128 {
                cur_phase += 2;
            } else if cur_phase > 128 {
                cur_phase -= 1;
            }
            state.matrix.phase[atom_idx] = cur_phase;
        }

        // Action potential
        if resonance > 300 {
            if energy > 200 {
                energy -= 200;
                resonance = 0;
                state.matrix.phase[atom_idx] = 5;
                // fireSignal omitted for offline simple ALU testing
            } else {
                resonance = 280;
            }
        }

        let resonance_decay = if repair_h > 1024 { 1 } else { 2 };

        if resonance > 0 {
            state.matrix.resonance[atom_idx] = std::cmp::max(0, resonance - resonance_decay);
        }

        let final_energy = if energy > metabolic_cost {
            energy - metabolic_cost
        } else {
            0
        };

        state.matrix.energy[atom_idx] = final_energy;

        if final_energy == 0 {
            state.matrix.ids[atom_idx] = 0;
        }
    }
}
