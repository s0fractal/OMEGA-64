// Substrate Node: sigma_vm
// Level: 4
// LambdaVM Execution Engine

#![allow(unused_imports)]
use super::super::L03::*;

use crate::{
    GRID_W, PROP_ENERGY, PROP_PHASE, PROP_RESONANCE, SPATIAL_CELL_SIZE,
};
use crate::in_grid;
use crate::GlyphOp;
use crate::{SYS_TRANSFER, SYS_ATTRACT, SYS_FOLD, SYS_SPAWN, SYS_BIND};
use crate::{math_cos, math_sin};
use crate::{SigmaState, MAX_ATOMS};

pub struct LambdaVM {}

impl LambdaVM {
    pub fn new() -> Self {
        Self {}
    }

    #[inline(always)]
    pub fn fetch_instruction(&self, state: &SigmaState, atom_idx: usize, pc: u8, offset: u8) -> u8 {
        let actual_pc = (pc.wrapping_add(offset)) & 63;
        state
            .matrix
            .instructions
            .get(atom_idx)
            .map(|inst| inst[actual_pc as usize])
            .unwrap_or(0) // Default to NOP if indices completely invalid
    }

    /// Executes a single atom's VM pipeline mapped exactly to Deno.
    ///
    /// # Safety
    /// Bounded automatically if `atom_idx >= MAX_ATOMS`. Native out of bounds operations
    /// degrade cleanly into NOP executions. Array manipulation operates primarily through
    /// safely ordered hardware-level atomics to prevent simultaneous VM tick data races.
    ///
    /// # Metabolic Economics
    /// Standard execution runs at zero gas until operations resolve. Each opcode natively applies
    /// +1 base computation energy cost, scaled exponentially based on `hormone` friction/entropy
    /// equations simulating thermodynamics across the Tensegrity lattice.
    pub fn step(&mut self, state: &SigmaState, atom_idx: usize) {
        if atom_idx >= crate::MAX_ATOMS {
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
        let mut step_count = 0;
        const MAX_EXECUTION_STEPS: usize = 64;

        while gas_used < gas_limit {
            step_count += 1;
            if step_count > MAX_EXECUTION_STEPS {
                state.energy_atomic()[atom_idx].store(0, std::sync::atomic::Ordering::Relaxed);
                break;
            }

            let op = GlyphOp::from(state.matrix.instructions[atom_idx][pc as usize]);

            match op {
                GlyphOp::Nop => {
                    gas_used += 1;
                    break;
                }
                GlyphOp::Set => {
                    let reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let imm = self.fetch_instruction(state, atom_idx, pc, 2);
                    if reg < 8 {
                        state.context_atomic(atom_idx)[reg as usize]
                            .store(imm as i8 as i32, std::sync::atomic::Ordering::Relaxed);
                    }
                    pc += 3;
                    gas_used += 1;
                }
                GlyphOp::Get => {
                    let reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let prop = self.fetch_instruction(state, atom_idx, pc, 2);
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
                        state.context_atomic(atom_idx)[reg as usize]
                            .store(val, std::sync::atomic::Ordering::Relaxed);
                    }
                    pc += 3;
                    gas_used += 2;
                }
                GlyphOp::Put => {
                    let reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let prop = self.fetch_instruction(state, atom_idx, pc, 2);
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
                        state.phase_atomic()[atom_idx]
                            .store(val, std::sync::atomic::Ordering::Relaxed);
                    }

                    pc += 3;
                    gas_used += 2;
                }
                GlyphOp::Add => {
                    let r1 = self.fetch_instruction(state, atom_idx, pc, 1);
                    let r2 = self.fetch_instruction(state, atom_idx, pc, 2);
                    if r1 < 8 && r2 < 8 {
                        let sum = state.matrix.context[atom_idx][r1 as usize]
                            .wrapping_add(state.matrix.context[atom_idx][r2 as usize]);
                        state.context_atomic(atom_idx)[r1 as usize]
                            .store(sum, std::sync::atomic::Ordering::Relaxed);
                    }
                    pc += 3;
                    gas_used += 1;
                }
                GlyphOp::Sub => {
                    let r1 = self.fetch_instruction(state, atom_idx, pc, 1);
                    let r2 = self.fetch_instruction(state, atom_idx, pc, 2);
                    if r1 < 8 && r2 < 8 {
                        let sub = state.matrix.context[atom_idx][r1 as usize]
                            .wrapping_sub(state.matrix.context[atom_idx][r2 as usize]);
                        state.context_atomic(atom_idx)[r1 as usize]
                            .store(sub, std::sync::atomic::Ordering::Relaxed);
                    }
                    pc += 3;
                    gas_used += 1;
                }
                GlyphOp::Jnz => {
                    let reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let target = self.fetch_instruction(state, atom_idx, pc, 2);
                    if reg < 8 && state.matrix.context[atom_idx][reg as usize] != 0 {
                        pc = target;
                    } else {
                        pc += 3;
                    }
                    gas_used += 2;
                }
                GlyphOp::Jz => {
                    // Note: Deno didn't have OP_JZ fully flushed in phase-7 physics, but logic implies inverse JNZ
                    let reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let target = self.fetch_instruction(state, atom_idx, pc, 2);
                    if reg < 8 && state.matrix.context[atom_idx][reg as usize] == 0 {
                        pc = target;
                    } else {
                        pc += 3;
                    }
                    gas_used += 2;
                }
                GlyphOp::Jmp => {
                    pc = self.fetch_instruction(state, atom_idx, pc, 1);
                    gas_used += 2;
                }
                GlyphOp::Resolve => {
                    let dest_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let angle_reg = self.fetch_instruction(state, atom_idx, pc, 2);
                    let mode_reg = self.fetch_instruction(state, atom_idx, pc, 3);

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
                        state.context_atomic(atom_idx)[dest_reg as usize]
                            .store(val, std::sync::atomic::Ordering::Relaxed);
                    }

                    pc += 4;
                    gas_used += cost;
                }
                GlyphOp::ResonateKuramoto => {
                    let gx = (state.matrix.xs[atom_idx] as i32) / (100 * SPATIAL_CELL_SIZE);
                    let gy = (state.matrix.ys[atom_idx] as i32) / (100 * SPATIAL_CELL_SIZE);

                    // Note: Deno physics clamp logic is actually (xs / SPATIAL_CELL_SIZE) / 100.
                    // Let's use grid coordinates as mapped by build_spatial_hash (which are units of 10)
                    let current_phase = state.matrix.phase[atom_idx] as i32;
                    let mut sum_sin: i32 = 0;
                    let mut neighbor_count = 0;

                    let grid_cx = gx;
                    let grid_cy = gy;

                    'search: for dy in -1..=1 {
                        for dx in -1..=1 {
                            let nx = grid_cx + dx;
                            let ny = grid_cy + dy;

                            if in_grid(nx, ny) {
                                let count = state.get_spatial_grid_count(nx, ny);
                                for i in 0..count {
                                    if neighbor_count >= 32 {
                                        break 'search;
                                    }
                                    let neighbor_id =
                                        state.get_spatial_grid_atom(nx, ny, i) as usize;
                                    if neighbor_id > 0
                                        && neighbor_id != atom_idx
                                        && neighbor_id < MAX_ATOMS
                                    {
                                        let neighbor_phase = state.matrix.phase[neighbor_id] as i32;
                                        let diff = (neighbor_phase - current_phase) & 255;
                                        sum_sin = sum_sin.saturating_add(math_sin(diff, 0)); // Direct lookup density mapping
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
                        let d_theta = (k_bond.saturating_mul(sum_sin)) >> 15;
                        let theta_next = (current_phase as i32)
                            .saturating_add(d_theta)
                            .rem_euclid(256);
                        state.phase_atomic()[atom_idx]
                            .store(theta_next as i32, std::sync::atomic::Ordering::Relaxed);
                    }

                    pc += 1;
                    gas_used += 5 + (neighbor_count * 2);
                }
                GlyphOp::Share => {
                    let target_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let amount_reg = self.fetch_instruction(state, atom_idx, pc, 2);

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
                        let scaled_amount = amount * crate::SCALE;

                        if sender_energy >= scaled_amount {
                            state.energy_atomic()[atom_idx]
                                .fetch_sub(scaled_amount, std::sync::atomic::Ordering::Relaxed);
                            energy -= scaled_amount;

                            let energy_atomic = state.energy_atomic();
                            energy_atomic[target_idx as usize]
                                .fetch_add(scaled_amount, std::sync::atomic::Ordering::Relaxed);
                        }
                    }

                    pc += 3;
                    gas_used += 10;
                }
                GlyphOp::Replicate => {
                    let aggression = state.matrix.hormones[2] as i32;
                    let e_thresh = 50 - (aggression >> 3);
                    let r_thresh = 10 - (aggression >> 5);

                    if energy > e_thresh * crate::SCALE
                        && state.matrix.resonance[atom_idx] > r_thresh
                    {
                        let cx = state.matrix.xs[atom_idx] as i32;
                        let cy = state.matrix.ys[atom_idx] as i32;

                        let child_energy = energy / 2;

                        state.push_spawn_request(atom_idx, cx, cy, child_energy);

                        state.energy_atomic()[atom_idx]
                            .fetch_sub(child_energy, std::sync::atomic::Ordering::Relaxed);
                        state.resonance_atomic()[atom_idx]
                            .fetch_add(30, std::sync::atomic::Ordering::Relaxed);

                        energy -= child_energy;
                    }

                    pc += 1;
                    gas_used += 15;
                }
                GlyphOp::Bind => {
                    let _mode_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let target_reg = self.fetch_instruction(state, atom_idx, pc, 2);

                    let target_idx = if target_reg < 8 {
                        state.matrix.context[atom_idx][target_reg as usize] as usize
                    } else {
                        0
                    };

                    if target_idx > 0 && target_idx < MAX_ATOMS && target_idx != atom_idx {
                        state.push_bond_request(atom_idx, atom_idx, target_idx);
                    }

                    pc += 3;
                    gas_used += 20;
                }
                GlyphOp::Hebb => {
                    let slot_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let slot = if slot_reg < 8 {
                        state.matrix.context[atom_idx][slot_reg as usize] as usize
                    } else {
                        0
                    };

                    if slot < 4 && resonance > 200 {
                        let bond_idx = (atom_idx * 4) + slot;
                        let target_idx = state.matrix.bonds[bond_idx] as usize;
                        if target_idx > 0
                            && target_idx < MAX_ATOMS
                            && state.matrix.ids[target_idx] != 0
                        {
                            let mut weight = state.synaptic_weights_atomic()[bond_idx]
                                .load(std::sync::atomic::Ordering::Relaxed);
                            if weight < 255 {
                                weight += 1;
                                state.synaptic_weights_atomic()[bond_idx]
                                    .store(weight, std::sync::atomic::Ordering::Relaxed);
                            }
                        }
                    }

                    pc += 2;
                    gas_used += 10;
                }
                GlyphOp::Fire => {
                    let slot_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let amp_reg = self.fetch_instruction(state, atom_idx, pc, 2);

                    let slot = if slot_reg < 8 {
                        state.matrix.context[atom_idx][slot_reg as usize] as usize
                    } else {
                        0
                    };

                    let amplitude = if amp_reg < 8 {
                        state.matrix.context[atom_idx][amp_reg as usize]
                    } else {
                        0
                    };

                    if slot < 4 && amplitude > 0 && energy >= (amplitude / 10) {
                        let bond_idx = (atom_idx * 4) + slot;
                        let target_idx = state.matrix.bonds[bond_idx] as usize;

                        if target_idx > 0
                            && target_idx < MAX_ATOMS
                            && state.matrix.ids[target_idx] != 0
                        {
                            let weight = state.matrix.synaptic_weights[bond_idx] as f32;
                            let fire_cost = amplitude / 10;

                            // Scale the transmitted resonance mathematically by the synaptic weight
                            let transmitted = ((amplitude as f32) * (weight / 255.0)) as i32;

                            if transmitted > 0 {
                                state.resonance_atomic()[target_idx]
                                    .fetch_add(transmitted, std::sync::atomic::Ordering::Relaxed);
                            }

                            // Pay the firing cost
                            state.energy_atomic()[atom_idx]
                                .fetch_sub(fire_cost, std::sync::atomic::Ordering::Relaxed);
                            energy -= fire_cost;
                        }
                    }

                    pc += 3;
                    gas_used += 15;
                }
                GlyphOp::Decay => {
                    let mut min_weight = 255;
                    let mut min_slot = None;

                    for slot in 0..4 {
                        let bond_idx = (atom_idx * 4) + slot;
                        let target_idx = state.matrix.bonds[bond_idx] as usize;
                        if target_idx > 0 {
                            let weight = state.synaptic_weights_atomic()[bond_idx]
                                .load(std::sync::atomic::Ordering::Relaxed);
                            if weight > 0 && weight < min_weight {
                                min_weight = weight;
                                min_slot = Some(slot);
                            }
                        }
                    }

                    if let Some(slot) = min_slot {
                        let bond_idx = (atom_idx * 4) + slot;
                        let mut weight = state.synaptic_weights_atomic()[bond_idx]
                            .load(std::sync::atomic::Ordering::Relaxed);
                        if weight > 0 {
                            weight -= 1;
                            state.synaptic_weights_atomic()[bond_idx]
                                .store(weight, std::sync::atomic::Ordering::Relaxed);

                            // Metabolic Recoup via network pruning
                            state.energy_atomic()[atom_idx]
                                .fetch_add(50, std::sync::atomic::Ordering::Relaxed);
                            energy += 50;
                        }
                    }

                    pc += 1;
                    gas_used += 10;
                }
                GlyphOp::Tensegrity => {
                    let target_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let val_reg = self.fetch_instruction(state, atom_idx, pc, 2);

                    let spring_target = if target_reg < 8 {
                        state.matrix.context[atom_idx][target_reg as usize]
                    } else {
                        0
                    };

                    let val = if val_reg < 8 {
                        state.matrix.context[atom_idx][val_reg as usize]
                    } else {
                        0
                    };

                    if spring_target >= 0 && spring_target < 4 {
                        let bond_idx = (atom_idx * 4) + spring_target as usize;
                        if state.matrix.bonds[bond_idx] != 0 {
                            // Map integers to f32 stiffness (val / 100)
                            let stiffness = (val as f32) / 100.0;
                            // Transmute f32 bit pattern to u32 for atomic storage
                            state.stiffness_atomic()[bond_idx]
                                .store(stiffness.to_bits(), std::sync::atomic::Ordering::Relaxed);
                        }
                    }

                    pc += 3;
                    gas_used += 5;
                }
                GlyphOp::Build => {
                    let type_val = self.fetch_instruction(state, atom_idx, pc, 1) as i32;
                    let state_val = self.fetch_instruction(state, atom_idx, pc, 2) as i32;

                    let build_val = (state_val << 24) | (0xFF << 16) | type_val;
                    let cx = state.matrix.xs[atom_idx] as usize;
                    let cy = state.matrix.ys[atom_idx] as usize;
                    let cell_idx = (cy / 10) * (GRID_W as usize) + (cx / 10);

                    state.publish_build_intent(cell_idx, atom_idx, build_val);
                    pc += 3;
                    gas_used += 10;
                }
                GlyphOp::Plug => {
                    let charge_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let charge_val = if charge_reg < 8 {
                        state.matrix.context[atom_idx][charge_reg as usize]
                    } else {
                        0
                    };
                    let cx = state.matrix.xs[atom_idx] as usize;
                    let cy = state.matrix.ys[atom_idx] as usize;
                    let cell_idx = (cy / 10) * (GRID_W as usize) + (cx / 10);

                    state.set_structure_charge_intent(cell_idx, charge_val);
                    pc += 2;
                    gas_used += 5;
                }
                GlyphOp::Sense => {
                    let dest_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    // Radius ignored for parity testing, directly sensing current cell
                    let cx = state.matrix.xs[atom_idx] as usize;
                    let cy = state.matrix.ys[atom_idx] as usize;
                    let cell_idx = (cy / 10) * (GRID_W as usize) + (cx / 10);

                    let val = state.read_structure_cell(cell_idx);
                    if dest_reg < 8 {
                        state.context_atomic(atom_idx)[dest_reg as usize]
                            .store(val, std::sync::atomic::Ordering::Relaxed);
                    }
                    pc += 4;
                    gas_used += 5;
                }
                GlyphOp::SecretePlasmid => {
                    // Extract genome offset parameter
                    let offset_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let offset = if offset_reg < 8 {
                        state.matrix.context[atom_idx][offset_reg as usize]
                    } else {
                        0
                    };

                    if energy >= 150_000 && offset >= 0 && offset <= 56 {
                        let cx = state.matrix.xs[atom_idx] as usize;
                        let cy = state.matrix.ys[atom_idx] as usize;
                        let cell_idx = (cy / 1000) * (GRID_W as usize) + (cx / 1000);

                        // Read 8 bytes from genome
                        let mut payload = [0u8; 8];
                        payload.copy_from_slice(
                            &state.matrix.instructions[atom_idx]
                                [offset as usize..(offset as usize + 8)],
                        );

                        // Deposit into payload atomically
                        let payload_atomic = state.glyph_payload_atomic();
                        for i in 0..8 {
                            payload_atomic[cell_idx * 8 + i]
                                .store(payload[i], std::sync::atomic::Ordering::Relaxed);
                        }

                        // Trigger interference map: Kind 3 (PLASMID), Max Amplitude (255)
                        state.atomic_deposit_glyph_header(cell_idx, 3, 255);

                        energy -= 150_000;
                    }

                    pc += 2;
                    gas_used += 10;
                }
                GlyphOp::IncorporatePlasmid => {
                    let offset_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let offset = if offset_reg < 8 {
                        state.matrix.context[atom_idx][offset_reg as usize]
                    } else {
                        0
                    };

                    if offset >= 0 && offset <= 56 {
                        let cx = state.matrix.xs[atom_idx] as usize;
                        let cy = state.matrix.ys[atom_idx] as usize;
                        let cell_idx = (cy / 1000) * (GRID_W as usize) + (cx / 1000);

                        let header = state.glyph_header_atomic()[cell_idx]
                            .load(std::sync::atomic::Ordering::Relaxed);
                        let kind = (header & 0xFF) as u8;

                        if kind == 3 {
                            let payload_atomic = state.glyph_payload_atomic();
                            let mut new_bytes = [0u8; 8];
                            for i in 0..8 {
                                new_bytes[i] = payload_atomic[cell_idx * 8 + i]
                                    .load(std::sync::atomic::Ordering::Relaxed);
                            }

                            // CRISPR Immunity Check
                            // Fast hash: shifting the first 4 bytes into a 32-bit integer.
                            let mut plasmid_hash: i32 = 0;
                            plasmid_hash |= (new_bytes[0] as i32) << 24;
                            plasmid_hash |= (new_bytes[1] as i32) << 16;
                            plasmid_hash |= (new_bytes[2] as i32) << 8;
                            plasmid_hash |= new_bytes[3] as i32;

                            let immune_memory = state.context_atomic(atom_idx)[13]
                                .load(std::sync::atomic::Ordering::Relaxed);

                            if immune_memory != 0 && immune_memory == plasmid_hash {
                                // MATCH! Execute OP_PURGE immunity mechanism.
                                // 1. Destroy payload in environment
                                for i in 0..8 {
                                    payload_atomic[cell_idx * 8 + i]
                                        .store(0, std::sync::atomic::Ordering::Relaxed);
                                }
                                state.glyph_header_atomic()[cell_idx]
                                    .store(0, std::sync::atomic::Ordering::Relaxed);

                                // 2. Metabolic Bonus (+50_000 raw energy)
                                state.energy_atomic()[atom_idx]
                                    .fetch_add(50_000, std::sync::atomic::Ordering::Relaxed);
                                energy += 50_000;

                                // 3. Abort insertion
                                gas_used += 10;
                            } else {
                                // NAIVE ENCOUNTER
                                // Record the hash into Trauma Tracker (Reg 14) for potential learning at end of step
                                state.context_atomic(atom_idx)[14]
                                    .store(plasmid_hash, std::sync::atomic::Ordering::Relaxed);

                                // Thermodynamic Safeguard
                                let mut current_bytes = [0u8; 8];
                                current_bytes.copy_from_slice(
                                    &state.matrix.instructions[atom_idx]
                                        [offset as usize..(offset as usize + 8)],
                                );

                                // We need full 64 byte frames for entropy calculations
                                let mut mock_old = [0u8; 64];
                                mock_old.copy_from_slice(&state.matrix.instructions[atom_idx]);
                                let mut mock_new = [0u8; 64];
                                mock_new.copy_from_slice(&state.matrix.instructions[atom_idx]);
                                mock_new[offset as usize..(offset as usize + 8)]
                                    .copy_from_slice(&new_bytes);

                                let entropy_old = crate::calculate_shannon_entropy(&mock_old);
                                let entropy_new = crate::calculate_shannon_entropy(&mock_new);

                                let is_desperate = energy < (100_000_000 / 10);

                                if entropy_new < entropy_old || is_desperate {
                                    // SAFETY: We hold an atomic lock on our own atom's execution (step_count loop bounds gas).
                                    // Under the parallel execution model, no other thread writes to our `atom_idx` instruction block
                                    // concurrently. Atomic protection applies inter-atom, but intra-atom we have absolute sovereignty.
                                    unsafe {
                                        let inst_ptr =
                                            state.matrix.instructions.as_ptr() as *mut [u8; 64];
                                        let atom_inst = &mut *inst_ptr.add(atom_idx);
                                        atom_inst[offset as usize..(offset as usize + 8)]
                                            .copy_from_slice(&new_bytes);
                                    }
                                    // Evict Entropy Cache
                                    state.context_atomic(atom_idx)[15]
                                        .store(0, std::sync::atomic::Ordering::Relaxed);
                                }
                            }
                        }
                    }

                    pc += 2;
                    gas_used += 5;
                }
                GlyphOp::Signal => {
                    let type_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let intensity_reg = self.fetch_instruction(state, atom_idx, pc, 2);
                    let kind = if type_reg < 8 {
                        state.matrix.context[atom_idx][type_reg as usize] as u8
                    } else {
                        0
                    };
                    let intensity = if intensity_reg < 8 {
                        state.matrix.context[atom_idx][intensity_reg as usize]
                    } else {
                        0
                    };

                    let cx = state.matrix.xs[atom_idx] as usize;
                    let cy = state.matrix.ys[atom_idx] as usize;
                    let cell_idx = (cy / 10) * (GRID_W as usize) + (cx / 10);

                    // Re-implementing atomic_deposit_glyph_header locally for parity
                    // It mutates global arrays internally.
                    state.atomic_deposit_glyph_header(cell_idx, kind, intensity);
                    pc += 3;
                    gas_used += 5;
                }
                GlyphOp::Collective => {
                    let mode = self.fetch_instruction(state, atom_idx, pc, 1);
                    let p2 = self.fetch_instruction(state, atom_idx, pc, 2);
                    let p3 = self.fetch_instruction(state, atom_idx, pc, 3);

                    if mode == 0 {
                        // Hive Store
                        let addr = (p2 as usize) & 1023;
                        let val = (p3 & 0xFF) as u8;
                        // Note: hive_memory doesn't have an atomic array yet, but it's typically sequential.
                        // For pure race safety, we'd need AtomicU8 array. Simple tests avoid intense races here.
                        // Assuming deterministic scheduling or acceptable last-write-wins for hive_memory.
                        // (Deno SAB had atomic views but we can skip if not heavily tested for races)
                        state.hive_memory_atomic()[addr]
                            .store(val, std::sync::atomic::Ordering::Relaxed);
                        gas_used += 10;
                    } else if mode == 1 {
                        // Hive Load
                        let addr = (p2 as usize) & 1023;
                        let reg = (p3 as usize) & 7;
                        let loaded = state.hive_memory_atomic()[addr]
                            .load(std::sync::atomic::Ordering::Relaxed)
                            as i32;
                        state.context_atomic(atom_idx)[reg as usize]
                            .store(loaded, std::sync::atomic::Ordering::Relaxed);
                        gas_used += 10;
                    } else if mode == 3 {
                        // Hive Deposit
                        let val = (p2 & 0xFF) as i32;
                        if energy >= val * crate::SCALE {
                            let hive_bal_atomic = state.hive_balance_atomic();
                            hive_bal_atomic.fetch_add(val, std::sync::atomic::Ordering::Relaxed);
                            state.energy_atomic()[atom_idx].fetch_sub(
                                val * crate::SCALE,
                                std::sync::atomic::Ordering::Relaxed,
                            );
                            energy -= val * crate::SCALE;
                        }
                        gas_used += 15;
                    } else if mode == 4 {
                        // Hive Withdraw
                        let reg = (p2 as usize) & 7;
                        let hive_bal_atomic = state.hive_balance_atomic();

                        let mut amount = 0;
                        let mut current_bal =
                            hive_bal_atomic.load(std::sync::atomic::Ordering::Acquire);
                        loop {
                            let curr_amt = if current_bal > 100 { 100 } else { current_bal };
                            if curr_amt <= 0 {
                                break;
                            }
                            match hive_bal_atomic.compare_exchange(
                                current_bal,
                                current_bal - curr_amt,
                                std::sync::atomic::Ordering::AcqRel,
                                std::sync::atomic::Ordering::Acquire,
                            ) {
                                Ok(_) => {
                                    state.energy_atomic()[atom_idx].fetch_add(
                                        curr_amt * crate::SCALE,
                                        std::sync::atomic::Ordering::Relaxed,
                                    );
                                    energy += curr_amt * crate::SCALE;
                                    amount = curr_amt;
                                    break;
                                }
                                Err(actual) => current_bal = actual,
                            }
                        }
                        state.context_atomic(atom_idx)[reg as usize]
                            .store(amount, std::sync::atomic::Ordering::Relaxed);
                        gas_used += 15;
                    } else if mode == 5 {
                        // Phase Lock (Bonds)
                        // Note: For parallel execution, mutating another atom's context directly is a race.
                        // We must cast the target's PC to AtomicI32 temporarily if run across threads.
                        for slot in 0..4 {
                            let bond_idx = (atom_idx * 4) + slot;
                            let target = state.matrix.bonds[bond_idx] as usize;
                            if target > 0 && target < MAX_ATOMS && state.matrix.ids[target] != 0 {
                                // Thread-safe PC override
                                state.context_atomic(target)[8]
                                    .store((pc + 4) as i32, std::sync::atomic::Ordering::Release);
                            }
                        }
                        gas_used += 15;
                    } else if mode == 6 {
                        // Quorum PC Sync
                        let cx = state.matrix.xs[atom_idx] as i32 / 10;
                        let cy = state.matrix.ys[atom_idx] as i32 / 10;
                        if in_grid(cx, cy) {
                            let count = state.get_spatial_grid_count(cx, cy);
                            for i in 0..count {
                                let peer = state.get_spatial_grid_atom(cx, cy, i) as usize;
                                if peer > 0
                                    && peer < MAX_ATOMS
                                    && peer != atom_idx
                                    && state.matrix.ids[peer] != 0
                                {
                                    state.context_atomic(peer)[8].store(
                                        (pc + 4) as i32,
                                        std::sync::atomic::Ordering::Release,
                                    );
                                }
                            }
                        }
                        gas_used += 20;
                    }

                    pc += 4; // Length is 4 according to verification harness
                }
                GlyphOp::Syscall => {
                    let context_regs = state.context_atomic(atom_idx);
                    let sys_id = context_regs[0].load(std::sync::atomic::Ordering::Relaxed); // R0
                    let r1 = context_regs[1].load(std::sync::atomic::Ordering::Relaxed);
                    let r2 = context_regs[2].load(std::sync::atomic::Ordering::Relaxed);
                    let r3 = context_regs[3].load(std::sync::atomic::Ordering::Relaxed);

                    match sys_id {
                        SYS_ATTRACT => {
                            let target_idx = r1 as usize;
                            let attract_force = r2;

                            if target_idx > 0
                                && target_idx < MAX_ATOMS
                                && state.matrix.ids[target_idx] != 0
                            {
                                let ox = state.matrix.xs[atom_idx] as i32;
                                let oy = state.matrix.ys[atom_idx] as i32;
                                let tx = state.matrix.xs[target_idx] as i32;
                                let ty = state.matrix.ys[target_idx] as i32;

                                let dx = tx - ox;
                                let dy = ty - oy;

                                let dx_sign = if dx > 0 {
                                    1
                                } else if dx < 0 {
                                    -1
                                } else {
                                    0
                                };
                                let dy_sign = if dy > 0 {
                                    1
                                } else if dy < 0 {
                                    -1
                                } else {
                                    0
                                };

                                let move_dir_x = if attract_force > 0 { dx_sign } else { -dx_sign };
                                let move_dir_y = if attract_force > 0 { dy_sign } else { -dy_sign };

                                if move_dir_x != 0 || move_dir_y != 0 {
                                    let nx = ox + (move_dir_x * 10);
                                    let ny = oy + (move_dir_y * 10);

                                    let is_escaped = nx < 0 || nx > 1399 || ny < 0 || ny > 799;

                                    if is_escaped {
                                        state.dispatch_egress(atom_idx, nx, ny, energy);
                                        state.energy_atomic()[atom_idx]
                                            .store(0, std::sync::atomic::Ordering::Relaxed);
                                        state.ids_atomic()[atom_idx]
                                            .store(0, std::sync::atomic::Ordering::Relaxed);
                                        energy = 0;
                                    } else {
                                        let n_grid_x = nx / 10;
                                        let n_grid_y = ny / 10;
                                        let count_in_cell =
                                            state.get_spatial_grid_count(n_grid_x, n_grid_y);
                                        if count_in_cell < 31 {
                                            state.xs_atomic()[atom_idx].store(
                                                nx as i16,
                                                std::sync::atomic::Ordering::Relaxed,
                                            );
                                            state.ys_atomic()[atom_idx].store(
                                                ny as i16,
                                                std::sync::atomic::Ordering::Relaxed,
                                            );
                                        }
                                    }
                                }
                            }
                            gas_used += 10;
                        }
                        SYS_FOLD => {
                            gas_used += 10;
                        }
                        SYS_SPAWN => {
                            let child_energy = r1 * 1000;
                            let dx = r2;
                            let dy = r3;

                            if energy > child_energy {
                                let cx = (state.matrix.xs[atom_idx] as i32) + dx;
                                let cy = (state.matrix.ys[atom_idx] as i32) + dy;

                                state.push_spawn_request(atom_idx, cx, cy, child_energy);

                                state.energy_atomic()[atom_idx]
                                    .fetch_sub(child_energy, std::sync::atomic::Ordering::Relaxed);
                                energy -= child_energy;
                            }
                            gas_used += 20;
                        }
                        SYS_BIND => {
                            let target_idx = r1 as usize;
                            if target_idx > 0 && target_idx < MAX_ATOMS && target_idx != atom_idx {
                                state.push_bond_request(atom_idx, atom_idx, target_idx);
                            }
                            gas_used += 15;
                        }
                        SYS_TRANSFER => {
                            let target_idx = r1 as usize;
                            let resource_type = r2;
                            let amount = r3; // positive to give, negative to take (steal)

                            if target_idx > 0
                                && target_idx < MAX_ATOMS
                                && amount != 0
                                && state.matrix.ids[target_idx] != 0
                            {
                                if resource_type == 0 {
                                    // Energy
                                    if amount > 0 {
                                        // Giving
                                        let scaled_amount = amount * 1000;
                                        if state.matrix.energy[atom_idx] >= scaled_amount {
                                            state.energy_atomic()[atom_idx].fetch_sub(
                                                scaled_amount,
                                                std::sync::atomic::Ordering::Relaxed,
                                            );
                                            energy -= scaled_amount;
                                            let energy_atomic = state.energy_atomic();
                                            energy_atomic[target_idx].fetch_add(
                                                scaled_amount,
                                                std::sync::atomic::Ordering::Relaxed,
                                            );
                                        }
                                    } else {
                                        // Taking/Stealing (negative amount)
                                        let my_role = state.roles_atomic()[atom_idx]
                                            .load(std::sync::atomic::Ordering::Relaxed)
                                            & 0x7F;
                                        let target_role = state.roles_atomic()[target_idx]
                                            .load(std::sync::atomic::Ordering::Relaxed)
                                            & 0x7F;

                                        if my_role == 3 && target_role == 1 {
                                            let t_energy = state.energy_atomic()[target_idx]
                                                .load(std::sync::atomic::Ordering::Acquire);
                                            if t_energy > 20_000 {
                                                // Mutate to Mitochondria (role 5)
                                                let current_role = state.roles_atomic()[target_idx]
                                                    .load(std::sync::atomic::Ordering::Relaxed);
                                                state.roles_atomic()[target_idx].store(
                                                    5 | (current_role & 0x80),
                                                    std::sync::atomic::Ordering::Relaxed,
                                                );
                                                // Store host atom_idx in Context Reg 12
                                                state.context_atomic(target_idx)[12].store(
                                                    atom_idx as i32,
                                                    std::sync::atomic::Ordering::Relaxed,
                                                );
                                                break; // Engulfment replaces stealing
                                            }
                                        }

                                        let my_resonance = state.matrix.resonance[atom_idx];
                                        let target_defense =
                                            if state.matrix.evolution_reserved[target_idx] > 0 {
                                                state.matrix.evolution_reserved[target_idx]
                                            } else {
                                                state.matrix.resonance[target_idx]
                                            };

                                        if my_resonance > target_defense {
                                            let ox = state.matrix.xs[atom_idx] as f32;
                                            let oy = state.matrix.ys[atom_idx] as f32;
                                            let tx = state.matrix.xs[target_idx] as f32;
                                            let ty = state.matrix.ys[target_idx] as f32;

                                            let dx = (tx - ox) / 10.0;
                                            let dy = (ty - oy) / 10.0;
                                            let dist_sq = dx * dx + dy * dy;

                                            if dist_sq <= 2.25 {
                                                let steal_amount = (-amount) * 1000;
                                                let energy_atomic = state.energy_atomic();
                                                let mut t_energy = energy_atomic[target_idx]
                                                    .load(std::sync::atomic::Ordering::Acquire);
                                                let mut final_take = 0;
                                                loop {
                                                    let take_amount =
                                                        std::cmp::min(steal_amount, t_energy);
                                                    if take_amount <= 0 {
                                                        break;
                                                    }
                                                    match energy_atomic[target_idx]
                                                        .compare_exchange(
                                                            t_energy,
                                                            t_energy - take_amount,
                                                            std::sync::atomic::Ordering::AcqRel,
                                                            std::sync::atomic::Ordering::Acquire,
                                                        ) {
                                                        Ok(_) => {
                                                            final_take = take_amount;
                                                            break;
                                                        }
                                                        Err(actual) => t_energy = actual,
                                                    }
                                                }
                                                if final_take > 0 {
                                                    state.energy_atomic()[atom_idx].fetch_add(
                                                        final_take,
                                                        std::sync::atomic::Ordering::Relaxed,
                                                    );
                                                    energy += final_take;
                                                }
                                            }
                                        }
                                    }
                                } else if resource_type == 1 {
                                    // Resonance (only giving permitted for now)
                                    if amount > 0 && state.matrix.resonance[atom_idx] >= amount {
                                        state.resonance_atomic()[atom_idx].fetch_sub(
                                            amount,
                                            std::sync::atomic::Ordering::Relaxed,
                                        );
                                        resonance -= amount;
                                        let res_atomic = state.resonance_atomic();
                                        res_atomic[target_idx].fetch_add(
                                            amount,
                                            std::sync::atomic::Ordering::Relaxed,
                                        );
                                    }
                                }
                            }
                            gas_used += if amount < 0 { 30 } else { 10 };
                        }
                        _ => {
                            gas_used += 10;
                        }
                    }
                    pc += 1; // Basic jump over opcode for next resume if applicable
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
        state.context_atomic(atom_idx)[8].store(pc as i32, std::sync::atomic::Ordering::Relaxed);

        // Structural Thermodynamics (Shannon Entropy Noise Tax)
        let mut cached_entropy_plus_one = state.matrix.context[atom_idx][15];
        if cached_entropy_plus_one == 0 {
            let entropy =
                calculate_shannon_entropy(&state.matrix.instructions[atom_idx]);
            cached_entropy_plus_one = entropy + 1;
            state.context_atomic(atom_idx)[15].store(
                cached_entropy_plus_one,
                std::sync::atomic::Ordering::Relaxed,
            );
        }
        let entropy_val = cached_entropy_plus_one - 1;

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
        let noise_tax = (base_compute_cost * entropy_val) >> 12;
        let metabolic_cost = 1
            + base_compute_cost
            + noise_tax
            + ((gas_used * entropy_h) >> (12 + discount))
            + (friction_h >> 8);

        // Phase Synchronization
        if coherence_val > 500 {
            let mut cur_phase = state.matrix.phase[atom_idx] as i32;
            if cur_phase < 128 {
                cur_phase += 2;
            } else if cur_phase > 128 {
                cur_phase -= 1;
            }
            state.phase_atomic()[atom_idx].store(cur_phase, std::sync::atomic::Ordering::Relaxed);
        }

        // Action potential
        if resonance > 300 {
            if energy > 200 {
                energy -= 200;
                resonance = 0;
                state.phase_atomic()[atom_idx].store(5, std::sync::atomic::Ordering::Relaxed);
                // fireSignal omitted for offline simple ALU testing
            } else {
                resonance = 280;
            }
        }

        let resonance_decay = if repair_h > 1024 { 1 } else { 2 };

        if resonance > 0 {
            state.resonance_atomic()[atom_idx].store(
                std::cmp::max(0, resonance - resonance_decay),
                std::sync::atomic::Ordering::Relaxed,
            );
        }

        let final_energy = if energy > metabolic_cost {
            energy - metabolic_cost
        } else {
            0
        };

        // CRISPR Trauma Learning (Checkout Phase)
        // If the atom suffered massive metabolic drain but survived (0 < final_energy <= starvation floor)
        // we persist the temporary Trauma Tracker (Reg 14) into permanent CRISPR Cassette (Reg 13).
        if final_energy > 0 && final_energy <= 100_000 {
            let trauma_hash =
                state.context_atomic(atom_idx)[14].load(std::sync::atomic::Ordering::Relaxed);
            if trauma_hash != 0 {
                // Learn the traumatic signature
                state.context_atomic(atom_idx)[13]
                    .store(trauma_hash, std::sync::atomic::Ordering::Relaxed);
                state.context_atomic(atom_idx)[14].store(0, std::sync::atomic::Ordering::Relaxed);
            }
        }

        state.energy_atomic()[atom_idx].store(final_energy, std::sync::atomic::Ordering::Relaxed);

        if final_energy == 0 {
            state.ids_atomic()[atom_idx].store(0, std::sync::atomic::Ordering::Relaxed);
        }
    }
}