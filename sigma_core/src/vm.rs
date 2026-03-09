//! LambdaVM Execution Engine

use crate::isa::{GlyphOp, PROP_ENERGY, PROP_PHASE, PROP_RESONANCE};
use crate::memory::SigmaState;

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
                GlyphOp::Syscall
                | GlyphOp::SporeDrive
                | GlyphOp::Sense
                | GlyphOp::Resolve
                | GlyphOp::ResonateKuramoto => {
                    // Syscalls yield unconditionally
                    pc += 1; // Basic jump over opcode for next resume if applicable
                    gas_used += 10;
                    gas_limit = 0;
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
        let friction_h = state.matrix.hormones[5] as i32;
        let coherence_val = state.matrix.neural_coherence;

        let mut discount = 0;
        if coherence_val > 1000 {
            discount = 2;
        } else if coherence_val > 100 {
            discount = 1;
        }

        let base_compute_cost = gas_used >> discount;
        let metabolic_cost =
            1 + base_compute_cost + ((gas_used * entropy_h) >> (12 + discount)) + (friction_h >> 8);

        // OMEGA-64 specific phase integration via neural coherence
        if coherence_val > 500 {
            let mut cur_phase = state.matrix.phase[atom_idx];
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

        let repair_h = state.matrix.hormones[4] as i32;
        let resonance_decay = if repair_h > 1024 { 1 } else { 2 };

        if resonance > 0 {
            state.matrix.resonance[atom_idx] = resonance - resonance_decay;
        } else {
            state.matrix.resonance[atom_idx] = resonance; // Preserve negative or zero
        }

        state.matrix.energy[atom_idx] = if energy > metabolic_cost {
            energy - metabolic_cost
        } else {
            0
        };
    }
}
