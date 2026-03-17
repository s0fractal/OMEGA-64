---
id: sigma_ffi
type: substrate_module
target: rust
deps:
  - SYSTEM_CONSTANTS
  - SYSTEM_CONSTANTS
  - sigma_memory
description: FFI bridging logic and memory alignment for WebAssembly workers
---

# `FFI` logic

```rust
#[allow(non_snake_case)]
use std::mem::ManuallyDrop;

// The Deno `SharedArrayBuffer` uses real pointers but from JS the offset starts at 0.
// `SAFETY_BUFFER` ends at exactly 7,999,992.
// `SigmaMatrix` now begins natively at `tick_counter` (offset 7,999,992 in the Deno memory map).
// By taking the 0-indexed memory pointer from WASM + 7,999,992 bytes,
// we alias directly onto our Struct matching JS indices perfectly.

// `SigmaMatrix` logically begins at address SAFETY_BUFFER natively matching the Deno SAB.

unsafe fn get_ffi_state() -> ManuallyDrop<SigmaState> {
    let lattice_ptr = crate::LATTICE_PTR.load(std::sync::atomic::Ordering::SeqCst);
    let base_ptr = if lattice_ptr.is_null() {
        crate::SAFETY_BUFFER as *mut crate::SigmaMatrix
    } else {
        unsafe { lattice_ptr.add(crate::SAFETY_BUFFER) as *mut crate::SigmaMatrix }
    };
    let state = unsafe { SigmaState::from_raw(base_ptr) };
    ManuallyDrop::new(state)
}

#[unsafe(no_mangle)]
pub extern "C" fn debug_get_instruction(idx: usize, pc: usize) -> i32 {
    let state = unsafe { get_ffi_state() };
    state.matrix.instructions[idx][pc] as i32
}

#[unsafe(no_mangle)]
pub extern "C" fn debug_get_xs(idx: usize) -> i32 {
    let state = unsafe { get_ffi_state() };
    state.matrix.xs[idx] as i32
}

#[unsafe(no_mangle)]
pub extern "C" fn execute_atom(idx: usize) {
    let mut state = unsafe { get_ffi_state() };
    let mut vm = crate::LambdaVM::new();
    vm.step(&mut state, idx);
}

#[unsafe(no_mangle)]
pub extern "C" fn ffi_tick_all_atoms(start_idx: usize, end_idx: usize) {
    let mut state = unsafe { get_ffi_state() };
    let mut vm = crate::LambdaVM::new();
    for i in start_idx..end_idx {
        if i < crate::MAX_ATOMS && state.matrix.ids[i] != 0 {
            vm.step(&mut state, i);
        }
    }
}

#[unsafe(no_mangle)]
#[export_name = "tick_environment"]
pub extern "C" fn ffi_tick_environment(tick: u32) {
    let mut state = unsafe { get_ffi_state() };
    crate::tick_environment(&mut state, tick as i32);
}

#[unsafe(no_mangle)]
pub extern "C" fn tick_matrix() {
    let _state = unsafe { get_ffi_state() };
    // Assuming mapping to pulse double buffering of coords natively:
    // (This existed in JS before pulse.rs orchestrator took over in Rust)
    // For now we'll do nothing, as PulseOrchestrator handles this.
}

#[unsafe(no_mangle)]
#[export_name = "tick_structure_grid"]
pub extern "C" fn ffi_tick_structure_grid() {
    let mut state = unsafe { get_ffi_state() };
    crate::tick_structure_grid(&mut state);
}

use std::cell::RefCell;

thread_local! {
    static VISITED_POOL: RefCell<Vec<u8>> = RefCell::new(Vec::with_capacity(crate::MAX_ATOMS));
}

#[unsafe(no_mangle)]
pub extern "C" fn tick_membrane_physics() {
    let mut state = unsafe { get_ffi_state() };

    VISITED_POOL.with(|pool| {
        let mut visited = pool.borrow_mut();
        visited.clear();
        visited.resize(crate::MAX_ATOMS, 0);

        use std::collections::VecDeque;

        for i in 1..crate::MAX_ATOMS {
            if state.matrix.ids[i] != 0 {
                state.matrix.roles[i] &= !(crate::AtomRole::MetazoanFlag as u8);
                state.matrix.evolution_reserved[i] = 0;
            }
        }

        let mut tissues: Vec<Vec<usize>> = Vec::new();

        for start_node in 1..crate::MAX_ATOMS {
            if state.matrix.ids[start_node] == 0 || visited[start_node] == 1 {
                continue;
            }

            let mut component = Vec::new();
            let mut queue = VecDeque::new();
            queue.push_back(start_node);
            visited[start_node] = 1;

            while let Some(current) = queue.pop_front() {
                component.push(current);
                for b_slot in 0..4 {
                    let target = state.matrix.bonds[(current * 4) + b_slot] as usize;
                    if target > 0 && target < crate::MAX_ATOMS && state.matrix.ids[target] != 0 {
                        if visited[target] == 0 {
                            visited[target] = 1;
                            queue.push_back(target);
                        }
                    }
                }
            }

            if component.len() >= 3 {
                tissues.push(component);
            }
        }

        for tissue in &tissues {
            let count = tissue.len() as i64;
            let mut sum_energy: i64 = 0;
            let mut sum_resonance: i64 = 0;
            let mut total_dx = 0i32;
            let mut total_dy = 0i32;
            let mut architect_count = 0;

            for &node in tissue {
                sum_energy += state.matrix.energy[node] as i64;
                sum_resonance += state.matrix.resonance[node] as i64;
                
                let mut internal_bonds = 0;
                for b_slot in 0..4 {
                    let target = state.matrix.bonds[(node * 4) + b_slot] as usize;
                    if target > 0 && target < crate::MAX_ATOMS && tissue.contains(&target) {
                        internal_bonds += 1;
                    }
                }

                if internal_bonds < 3 {
                    state.matrix.roles[node] = (state.matrix.roles[node] & 0x80) | 2;
                } else {
                    state.matrix.roles[node] = (state.matrix.roles[node] & 0x80) | 3;
                    let dx = (state.matrix.xs[node] - state.matrix.physics_read_xs[node]) as i32;
                    let dy = (state.matrix.ys[node] - state.matrix.physics_read_ys[node]) as i32;
                    if dx != 0 || dy != 0 {
                        total_dx += dx;
                        total_dy += dy;
                        architect_count += 1;
                    }
                }
                state.matrix.roles[node] |= 0x80;
            }

            let avg_energy = (sum_energy / count) as i32;
            let avg_resonance = (sum_resonance / count) as i32;
            let (final_dx, final_dy) = if architect_count > 0 {
                (total_dx / architect_count, total_dy / architect_count)
            } else {
                (0, 0)
            };

            for &node in tissue {
                state.matrix.energy[node] = avg_energy;
                state.matrix.resonance[node] = avg_resonance;
                state.matrix.evolution_reserved[node] = sum_resonance as i32;

                if (final_dx != 0 || final_dy != 0) && (state.matrix.roles[node] & 0x7F) != 3 {
                    state.matrix.xs[node] = (state.matrix.physics_read_xs[node] as i32 + final_dx) as i16;
                    state.matrix.ys[node] = (state.matrix.physics_read_ys[node] as i32 + final_dy) as i16;
                }
            }
        }
    });
}

#[unsafe(no_mangle)]
pub extern "C" fn build_spatial_hash() {
    let mut state = unsafe { get_ffi_state() };
    state.build_spatial_hash();
}

#[unsafe(no_mangle)]
pub extern "C" fn get_spatial_hash_overflow_count() -> i32 {
    0 // Deprecated in favor of direct metric array
}

// Memory mapping diagnosis hook
#[unsafe(no_mangle)]
pub extern "C" fn verify_memory_alignment(idx: usize, val: i32) {
    let state = unsafe { get_ffi_state() };
    state.xs_atomic()[idx].store(val as i16, std::sync::atomic::Ordering::Relaxed);
    state.context_atomic(idx)[0].store(val, std::sync::atomic::Ordering::Relaxed);
}

#[unsafe(no_mangle)]
pub extern "C" fn get_spatial_hash_max_cell_count() -> i32 {
    0 // Deprecated
}

#[unsafe(no_mangle)]
pub extern "C" fn reduce_atom_deltas(_start_idx: usize, _end_idx: usize) {
    // Handled generically by PulseOrchestrator now
}

#[unsafe(no_mangle)]
pub extern "C" fn get_neural_coherence() -> i32 {
    let state = unsafe { get_ffi_state() };
    state.matrix.neural_coherence
}

#[unsafe(no_mangle)]
pub extern "C" fn set_neural_coherence(val: i32) {
    let mut state = unsafe { get_ffi_state() };
    state.matrix.neural_coherence = val;
}

#[unsafe(no_mangle)]
#[export_name = "tickGlyphTransport"]
pub extern "C" fn ffi_tick_glyph_transport(_tick: u32) {
    let mut state = unsafe { get_ffi_state() };
    crate::tick_glyph_transport(&mut state);
}

#[unsafe(no_mangle)]
pub extern "C" fn resolve_bond_requests(_start: usize, _end: usize) -> i32 {
    let mut state = unsafe { get_ffi_state() };
    state.resolve_bond_requests()
}

#[unsafe(no_mangle)]
pub extern "C" fn drain_spawn_requests(tick: u32) -> i32 {
    let mut state = unsafe { get_ffi_state() };
    state.drain_spawn_requests(tick as i32)
}

#[unsafe(no_mangle)]
pub extern "C" fn clear_metabolism_stats() {
    // Replaced by application tick resetting local state inside Deno,
    // but exported to fulfill module demands.
}

#[unsafe(no_mangle)]
pub extern "C" fn accumulate_metabolism_stats(_start: usize, _end: usize) {
    // Reduced natively in Deno JS space with the Rust `reduce_atom_deltas` side effects.
}


#[unsafe(no_mangle)]
pub extern "C" fn run_shadow_simulation_ffi(
    atom_id: u32,
    ticks: u32,
    logic_ptr: u32,
    result_ptr: u32,
) -> i32 {
    let state = unsafe { get_ffi_state() };

    // The logic_ptr and result_ptr are offsets into the linear WASM memory (usually starts at 0).
    // The memory itself was built on JS `SharedArrayBuffer` mapping properly mapped against zero.
    // Ensure bounds are safe because OOB memory causes unreachable panic.
    if logic_ptr as usize + 64 > 500_039_680 || result_ptr as usize + 32 > 500_039_680 {
        return 0; // Failure
    }

    let hallucination_bytes = unsafe { &*(logic_ptr as usize as *const [u8; 64]) };

    let tick_ptr = 7_999_992 as *const i32;
    let start_tick = unsafe { *tick_ptr as u32 };

    let metrics = crate::run_shadow_simulation(
        &state,
        atom_id as u64,
        hallucination_bytes,
        ticks,
        start_tick,
    );

    // Write back the 32-byte struct to the provided result pointer
    // Structure: [energy_diff, resonance_diff, bonds_broken, bonds_formed, structural_value_change, population_diff, coherence_diff, divergence_tick]
    let result_slice =
        unsafe { std::slice::from_raw_parts_mut(result_ptr as usize as *mut i32, 8) };
    result_slice[0] = metrics.energy_diff;
    result_slice[1] = metrics.resonance_diff;
    result_slice[2] = metrics.bonds_broken as i32;
    result_slice[3] = metrics.bonds_formed as i32;
    result_slice[4] = metrics.structural_value_change;
    result_slice[5] = metrics.population_diff;
    result_slice[6] = metrics.coherence_diff;
    result_slice[7] = metrics.divergence_tick as i32;

    1 // Success indicator
}

#[unsafe(no_mangle)]
pub extern "C" fn ffi_get_sensory_vector(atom_id: usize, result_ptr: *mut f32) {
    let state = unsafe { get_ffi_state() };
    if atom_id >= crate::MAX_ATOMS || state.matrix.ids[atom_id] == 0 {
        return;
    }

    let x = state.matrix.xs[atom_id] as f32;
    let y = state.matrix.ys[atom_id] as f32;

    // Result mapping: [N, E, S, W] for Trophic, Threat, Glyph (12 floats)
    let result = unsafe { std::slice::from_raw_parts_mut(result_ptr, 12) };
    result.fill(0.0);

    let gx = (x as i32 / crate::SPATIAL_CELL_SIZE) as i32;
    let gy = (y as i32 / crate::SPATIAL_CELL_SIZE) as i32;

    // Search 5x5 window (2 cells radius)
    for dy in -2..=2 {
        for dx in -2..=2 {
            let cx = gx + dx;
            let cy = gy + dy;

            if cx < 0 || cx >= crate::GRID_W || cy < 0 || cy >= crate::GRID_H {
                continue;
            }

            let cell_idx = (cy * crate::GRID_W + cx) as usize;

            // 1. Accumulate Glyph (Signal) gradients
            let signal = state.matrix.signal_grid[cell_idx] as f32;
            if signal > 0.0 {
                let dist_sq = (dx * dx + dy * dy) as f32;
                let weight = 1.0 / (1.0 + dist_sq);
                if dy < 0 {
                    result[8] += signal * weight;
                } // North
                if dx > 0 {
                    result[9] += signal * weight;
                } // East
                if dy > 0 {
                    result[10] += signal * weight;
                } // South
                if dx < 0 {
                    result[11] += signal * weight;
                } // West
            }

            // 2. Accumulate Atom-based gradients (Trophic & Threat)
            let offset = cell_idx * 32;
            let count = state.matrix.spatial_grid[offset] as usize;
            let occupancy = if count > 31 { 31 } else { count };

            for i in 1..=occupancy {
                let neighbor_id = state.matrix.spatial_grid[offset + i] as usize;
                if neighbor_id == atom_id || neighbor_id >= crate::MAX_ATOMS {
                    continue;
                }

                let nx = state.matrix.xs[neighbor_id] as f32;
                let ny = state.matrix.ys[neighbor_id] as f32;
                let rx = nx - x;
                let ry = ny - y;
                let dist_sq = rx * rx + ry * ry;
                if dist_sq < 1.0 {
                    continue;
                }
                let dist = dist_sq.sqrt();
                let weight = 1.0 / dist;

                // Sectorization
                let (idx_off, val) = if state.matrix.roles[neighbor_id] == crate::ROLE_PARASITE {
                    (4, 1.0 / dist_sq) // Threat (Inverse Square)
                } else {
                    (0, state.matrix.energy[neighbor_id] as f32 * weight) // Trophic (Inverse)
                };

                if ry.abs() > rx.abs() {
                    if ry < 0.0 {
                        result[idx_off + 0] += val;
                    } // North
                    else {
                        result[idx_off + 2] += val;
                    } // South
                } else {
                    if rx < 0.0 {
                        result[idx_off + 3] += val;
                    } // West
                    else {
                        result[idx_off + 1] += val;
                    } // East
                }
            }
        }
    }

    // Normalization (Sigmoid-like squash)
    for i in 0..12 {
        result[i] = result[i] / (1000.0 + result[i]);
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn generate_epoch_proof_ffi(tick: u32, result_ptr: u32) {
    use sha2::{Digest, Sha256};
    let state = unsafe { get_ffi_state() };
    let mut hasher = Sha256::new();

    hasher.update(tick.to_le_bytes());

    for i in 1..crate::MAX_ATOMS {
        let id = state.matrix.ids[i];
        if id != 0 {
            hasher.update(id.to_le_bytes());
            hasher.update(state.matrix.energy[i].to_le_bytes());
            hasher.update(state.matrix.resonance[i].to_le_bytes());
            hasher.update(state.matrix.xs[i].to_le_bytes());
            hasher.update(state.matrix.ys[i].to_le_bytes());
            hasher.update(state.matrix.phase[i].to_le_bytes());
            hasher.update(state.matrix.logic[i]);
        }
    }

    for i in 0..crate::GRID_CELLS {
        let owner = state.matrix.structure_build_owner[i];
        if owner > 0 {
            hasher.update((i as u32).to_le_bytes());
            hasher.update(owner.to_le_bytes());
            hasher.update(state.matrix.structure_build_value[i].to_le_bytes());
            hasher.update(state.matrix.structure_charge_intent[i].to_le_bytes());
        }
    }

    let result = hasher.finalize();
    let result_slice =
        unsafe { std::slice::from_raw_parts_mut(result_ptr as usize as *mut u8, 32) };
    result_slice.copy_from_slice(&result);
}
```
