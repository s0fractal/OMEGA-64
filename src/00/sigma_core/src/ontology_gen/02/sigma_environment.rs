// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/sigma_environment.md
// Substrate Node: sigma_environment
// Level: 2
// Ticks environmental cellular automata, structural cells, and glyphi transport

#![allow(unused_imports)]
use super::super::L01::*;

use crate::{
    GRID_H, GRID_W, MAX_ATOMS, STR_CAPACITOR, STR_DIODE, STR_INVERTER, STR_LATCH, STR_NODE,
    STR_SOURCE, STR_VOID, STR_WIRE, MAX_GLYPH_AMP, MIN_GLYPH_AMP
};
use crate::SigmaState;

pub fn tick_environment(state: &mut SigmaState, tick: i32) {
    tick_structure_grid(state);
    tick_glyph_transport(state);
    tick_synaptic_decay(state, tick);
}

fn unpack_glyph_kind(header: i32) -> i32 {
    header & 0xFF
}

fn unpack_glyph_amplitude(header: i32) -> i32 {
    header >> 8
}

fn pack_glyph_header(kind: i32, amplitude: i32) -> i32 {
    (amplitude << 8) | (kind & 0xFF)
}

fn decay_for_kind(kind: i32, amplitude: i32) -> i32 {
    let abs_amp = amplitude.abs();
    let decay_amt = if kind == 2 {
        if abs_amp > 256 {
            3
        } else {
            1
        }
    } else if kind == 1 {
        if abs_amp > 64 {
            8
        } else {
            4
        }
    } else {
        abs_amp
    };
    if amplitude > 0 {
        decay_amt
    } else {
        -decay_amt
    }
}

fn diffusion_share_for_kind(kind: i32, amplitude: i32) -> i32 {
    let abs_amp = amplitude.abs();
    let share_amt = if kind == 2 {
        if abs_amp >= 96 {
            abs_amp >> 3
        } else {
            0
        }
    } else if kind == 1 {
        if abs_amp >= 24 {
            abs_amp >> 2
        } else {
            0
        }
    } else {
        0
    };
    if amplitude > 0 {
        share_amt
    } else {
        -share_amt
    }
}

fn deposit_scratch_glyph_header(
    state: &mut SigmaState,
    cell: i32,
    kind: i32,
    amplitude: i32,
    payload_source: Option<[u8; 8]>,
) {
    if amplitude == 0 || cell < 0 || cell >= (GRID_W * GRID_H) {
        return;
    }

    let cell_idx = cell as usize;
    let current = state.matrix.glyph_scratch_header[cell_idx];
    let current_kind = unpack_glyph_kind(current);
    let current_amplitude = unpack_glyph_amplitude(current);

    if current_kind != 0 && current_kind != kind {
        if amplitude.abs() <= current_amplitude.abs() {
            return;
        }
        state.matrix.glyph_scratch_header[cell_idx] = pack_glyph_header(kind, amplitude);
        if kind == 2 {
            if let Some(payload) = payload_source {
                state.matrix.glyph_scratch_payload[cell_idx] = payload;
            }
        }
        return;
    }

    let mut next_amplitude = current_amplitude + amplitude;
    if next_amplitude > MAX_GLYPH_AMP {
        next_amplitude = MAX_GLYPH_AMP;
    }
    if next_amplitude < MIN_GLYPH_AMP {
        next_amplitude = MIN_GLYPH_AMP;
    }

    let next_kind = if next_amplitude == 0 { 0 } else { kind };
    state.matrix.glyph_scratch_header[cell_idx] = pack_glyph_header(next_kind, next_amplitude);

    if kind == 2 {
        if let Some(payload) = payload_source {
            state.matrix.glyph_scratch_payload[cell_idx] = payload;
        }
    }
}

pub fn tick_glyph_transport(state: &mut SigmaState) {
    // 1. Clear scratch buffers
    state.matrix.glyph_scratch_header.fill(0);
    state.matrix.glyph_scratch_payload.fill([0; 8]);

    let dx = [-1, 1, 0, 0];
    let dy = [0, 0, -1, 1];

    for cell in 0..(GRID_W * GRID_H) as usize {
        let header = state.matrix.glyph_header[cell];
        if header == 0 {
            continue;
        }

        let kind = unpack_glyph_kind(header);
        let amp = unpack_glyph_amplitude(header);
        if amp == 0 {
            continue;
        }

        let decay = decay_for_kind(kind, amp);

        // Bidirectional Decay
        let retained = if amp > 0 {
            std::cmp::max(0, amp - decay)
        } else {
            std::cmp::min(0, amp - decay)
        };

        if retained.abs() > 0 {
            let payload = if kind == 2 {
                Some(state.matrix.glyph_payload[cell])
            } else {
                None
            };
            deposit_scratch_glyph_header(state, cell as i32, kind, retained, payload);
        }

        let share = diffusion_share_for_kind(kind, amp);
        if share.abs() > 0 {
            let gx = (cell as i32) % GRID_W;
            let gy = (cell as i32) / GRID_W;

            for i in 0..4 {
                let nx = gx + dx[i];
                let ny = gy + dy[i];
                if in_grid(nx, ny) {
                    let next_cell = (ny * GRID_W + nx) as usize;
                    let payload = if share >= 128 || share <= -128 {
                        Some(state.matrix.glyph_payload[cell])
                    } else {
                        None
                    };
                    deposit_scratch_glyph_header(state, next_cell as i32, kind, share, payload);
                }
            }
        }
    }

    // 2. Internal Reflection (Signal -> Pheromone)
    for cell in 0..(GRID_W * GRID_H) as usize {
        let signal = state.matrix.signal_grid[cell];
        let abs_signal = signal.abs();
        if abs_signal >= 1 {
            let mut amp = abs_signal >> 1;
            if amp < 16 {
                amp = 16;
            }
            if amp > 512 {
                amp = 512;
            }
            deposit_scratch_glyph_header(state, cell as i32, 1, amp, None);

            if cell % 32 == 0 {
                state.matrix.secretion_stats[10] += 1; // Signal leak counter
            }
        }
    }

    // 3. Internal Reflection (Memory -> Plasmid)
    for cell in 0..(GRID_W * GRID_H) as usize {
        let mem = state.matrix.memory_grid[cell];
        // Read first 3 bytes as 24-bit little endian charge
        let memory_lo = u32::from_le_bytes([mem[0], mem[1], mem[2], mem[3]]);
        let charge = (memory_lo & 0xFFFFFF) as i32;

        if charge >= 1 {
            let mut amp = charge >> 2;
            if amp < 24 {
                amp = 24;
            }
            if amp > 384 {
                amp = 384;
            }
            deposit_scratch_glyph_header(state, cell as i32, 2, amp, Some(mem));

            if cell % 32 == 0 {
                state.matrix.secretion_stats[11] += 1; // Memory leak counter
            }
        }
    }

    // Copy scratch to primary
    state
        .matrix
        .glyph_header
        .copy_from_slice(&state.matrix.glyph_scratch_header);
    state
        .matrix
        .glyph_payload
        .copy_from_slice(&state.matrix.glyph_scratch_payload);
}

fn dir8_x(n: i32) -> i32 {
    match n {
        0 => -1,
        1 => 0,
        2 => 1,
        3 => -1,
        4 => 1,
        5 => -1,
        6 => 0,
        7 => 1,
        _ => 0,
    }
}

fn dir8_y(n: i32) -> i32 {
    match n {
        0 => -1,
        1 => -1,
        2 => -1,
        3 => 0,
        4 => 0,
        5 => 1,
        6 => 1,
        7 => 1,
        _ => 0,
    }
}

fn dir4_x(n: i32) -> i32 {
    match n {
        0 => -1,
        1 => 1,
        2 => 0,
        3 => 0,
        _ => 0,
    }
}

fn dir4_y(n: i32) -> i32 {
    match n {
        0 => 0,
        1 => 0,
        2 => -1,
        3 => 1,
        _ => 0,
    }
}

pub fn tick_structure_grid(state: &mut SigmaState) {
    for y in 0..GRID_H {
        for x in 0..GRID_W {
            let i = (y * GRID_W + x) as usize;
            let mut cell_val = state.matrix.structure_grid[i];
            let owner_raw = state.matrix.structure_build_owner[i];
            let owner = owner_raw & 0x7FFFFFFF; // STRUCTURE_INTENT_OWNER_MASK

            if owner != 0 {
                cell_val = state.matrix.structure_build_value[i];
            }

            let intent_charge_raw = state.matrix.structure_charge_intent[i];
            if intent_charge_raw > 0 {
                let mut intent_charge = intent_charge_raw;
                if intent_charge > 255 {
                    intent_charge = 255;
                }
                let base_charge = (cell_val >> 16) & 0xFF;
                if intent_charge > base_charge {
                    cell_val = (cell_val & !0x00FF0000) | (intent_charge << 16);
                }
            }

            if owner_raw != 0 || intent_charge_raw != 0 {
                state.matrix.structure_grid[i] = cell_val;
                if owner_raw != 0 {
                    state.matrix.structure_build_owner[i] = 0;
                    state.matrix.structure_build_value[i] = 0;
                }
                if intent_charge_raw != 0 {
                    state.matrix.structure_charge_intent[i] = 0;
                }
            }

            let str_type = cell_val & 0xFF;
            let current_charge = (cell_val >> 16) & 0xFF;

            // AUTOPOIESIS: Spontaneous Crystallization
            if str_type == STR_VOID {
                let mut max_n_charge = current_charge;
                for n in 0..8 {
                    let nx = x + dir8_x(n);
                    let ny = y + dir8_y(n);
                    if in_grid(nx, ny) {
                        let ni = (ny * GRID_W + nx) as usize;
                        let n_val = state.matrix.structure_grid[ni];
                        let n_charge = (n_val >> 16) & 0xFF;
                        if n_charge > max_n_charge {
                            max_n_charge = n_charge;
                        }
                    }
                }
                if max_n_charge > 100 {
                    let mut seed_charge = max_n_charge - 20;
                    if seed_charge < 64 {
                        seed_charge = 64;
                    }
                    if seed_charge > 255 {
                        seed_charge = 255;
                    }
                    state.matrix.structure_grid[i] = STR_WIRE | (seed_charge << 16);
                } else if current_charge > 0 {
                    let decayed = if current_charge > 8 {
                        current_charge - 8
                    } else {
                        0
                    };
                    state.matrix.structure_grid[i] = (cell_val & !0x00FF0000) | (decayed << 16);
                }
                continue;
            }

            let _state_param = (cell_val >> 24) & 0xFF;

            // Resonance Shielding
            let spatial_idx = (y * GRID_W + x) as usize;
            let avg_phase = state.matrix.spatial_grid[spatial_idx * 32 + 31];
            let decay = if avg_phase > 128 { 2 } else { 10 };

            let mut next_charge = if current_charge > decay {
                current_charge - decay
            } else {
                0
            };

            if str_type == STR_SOURCE {
                next_charge = 255;
            } else if str_type == STR_WIRE || str_type == STR_NODE || str_type == STR_CAPACITOR {
                next_charge =
                    update_charge_wire_node_cap(state, x, y, str_type, _state_param, next_charge);
            } else if str_type == STR_DIODE {
                next_charge = update_charge_diode(state, x, y, _state_param, next_charge);
            } else if str_type == STR_INVERTER {
                next_charge = update_charge_inverter(state, x, y);
            } else if str_type == STR_LATCH {
                let (new_state, nc) = update_charge_latch(state, x, y, _state_param);
                if new_state != _state_param {
                    cell_val = (cell_val & 0x00FFFFFF) | (new_state << 24);
                }
                next_charge = nc;
            }

            if str_type != STR_SOURCE && next_charge == 0 {
                let mut stabilized = false;
                for n in 0..4 {
                    let nx = x + dir4_x(n);
                    let ny = y + dir4_y(n);
                    if in_grid(nx, ny) {
                        let ni = (ny * GRID_W + nx) as usize;
                        let n_charge = (state.matrix.structure_grid[ni] >> 16) & 0xFF;
                        if n_charge > 20 {
                            stabilized = true;
                            break;
                        }
                    }
                }
                if !stabilized {
                    state.matrix.structure_grid[i] = STR_VOID;
                    continue;
                }
            }

            state.matrix.structure_grid[i] = (cell_val & !0x00FF0000) | (next_charge << 16);
        }
    }
}

fn update_charge_wire_node_cap(
    state: &SigmaState,
    x: i32,
    y: i32,
    str_type: i32,
    cell_state: i32,
    current_next_charge: i32,
) -> i32 {
    let mut max_neighbor_charge = 0;
    let mut charged_count = 0;
    let mut next_charge = current_next_charge;

    for n in 0..4 {
        let nx = x + dir4_x(n);
        let ny = y + dir4_y(n);
        if in_grid(nx, ny) {
            let ni = (ny * GRID_W + nx) as usize;
            let n_charge = (state.matrix.structure_grid[ni] >> 16) & 0xFF;
            if n_charge > max_neighbor_charge {
                max_neighbor_charge = n_charge;
            }
            if n_charge > 50 {
                charged_count += 1;
            }
        }
    }

    if str_type == STR_WIRE {
        let flow = max_neighbor_charge - 5;
        if flow > next_charge {
            next_charge = flow;
        }
    } else if str_type == STR_NODE {
        if cell_state == 1 {
            // AND
            if charged_count >= 2 {
                next_charge = 255;
            }
        } else {
            // OR
            if charged_count >= 1 {
                next_charge = 255;
            }
        }
    } else if str_type == STR_CAPACITOR {
        let flow = max_neighbor_charge - 2;
        if flow > next_charge {
            next_charge = flow;
        }
    }
    next_charge
}

fn update_charge_diode(
    state: &SigmaState,
    x: i32,
    y: i32,
    cell_state: i32,
    current_next_charge: i32,
) -> i32 {
    let mut nx = x;
    let mut ny = y;
    if cell_state == 0 {
        nx -= 1;
    } else if cell_state == 1 {
        nx += 1;
    } else if cell_state == 2 {
        ny -= 1;
    } else if cell_state == 3 {
        ny += 1;
    }

    let mut next_charge = current_next_charge;
    if in_grid(nx, ny) {
        let ni = (ny * GRID_W + nx) as usize;
        let n_charge = (state.matrix.structure_grid[ni] >> 16) & 0xFF;
        let flow = n_charge - 5;
        if flow > next_charge {
            next_charge = flow;
        }
    }
    next_charge
}

fn update_charge_inverter(state: &SigmaState, x: i32, y: i32) -> i32 {
    let mut max_neighbor_charge = 0;
    for n in 0..4 {
        let nx = x + dir4_x(n);
        let ny = y + dir4_y(n);
        if in_grid(nx, ny) {
            let ni = (ny * GRID_W + nx) as usize;
            let n_charge = (state.matrix.structure_grid[ni] >> 16) & 0xFF;
            if n_charge > max_neighbor_charge {
                max_neighbor_charge = n_charge; // Inverter passes zero when charged neighbors exist
            }
        }
    }
    if max_neighbor_charge < 50 {
        255
    } else {
        0
    }
}

fn update_charge_latch(state: &SigmaState, x: i32, y: i32, cell_state: i32) -> (i32, i32) {
    let mut new_state = cell_state;

    // n=0 (Left): SET
    let set_x = x + dir4_x(0);
    let set_y = y + dir4_y(0);
    if in_grid(set_x, set_y) {
        let n_charge =
            (state.matrix.structure_grid[(set_y * GRID_W + set_x) as usize] >> 16) & 0xFF;
        if n_charge > 100 {
            new_state = 1;
        }
    }

    // n=1 (Right): RESET
    let rst_x = x + dir4_x(1);
    let rst_y = y + dir4_y(1);
    if in_grid(rst_x, rst_y) {
        let n_charge =
            (state.matrix.structure_grid[(rst_y * GRID_W + rst_x) as usize] >> 16) & 0xFF;
        if n_charge > 100 {
            new_state = 0;
        }
    }

    let next_charge = if new_state == 1 { 255 } else { 0 };
    (new_state, next_charge)
}

fn tick_synaptic_decay(state: &mut SigmaState, tick: i32) {
    // Global slow-decay mechanism: Use it or lose it
    if tick % 100 == 0 {
        for bond_idx in 0..(MAX_ATOMS * 4) {
            let weight = state.matrix.synaptic_weights[bond_idx];
            if weight > 0 {
                state.matrix.synaptic_weights[bond_idx] = weight - 1;
            }
        }
    }
}