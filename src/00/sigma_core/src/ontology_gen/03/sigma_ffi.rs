// Substrate Node: sigma_ffi
// Level: 3
// FFI bridging logic and memory alignment for WebAssembly workers

#![allow(unused_imports)]
use super::super::L02::*;

#[allow(non_snake_case)]
use std::mem::ManuallyDrop;

// The Deno `SharedArrayBuffer` uses real pointers but from JS the offset starts at 0.
// `SAFETY_BUFFER` ends at exactly 7,999,992.
// `SigmaMatrix` now begins natively at `tick_counter` (offset 7,999,992 in the Deno memory map).
// By taking the 0-indexed memory pointer from WASM + 7,999,992 bytes,
// we alias directly onto our Struct matching JS indices perfectly.

// `SigmaMatrix` logically begins at address SAFETY_BUFFER natively matching the Deno SAB.

/// Creates a safely wrapped `SigmaState` mapping to the imported `SharedArrayBuffer`.
/// `ManuallyDrop` prevents Rust from trying to deallocate the imported WASM memory when `SigmaState` correctly orchestrates its execution horizon and drops.
unsafe fn get_ffi_state() -> ManuallyDrop<SigmaState> {
    // In wasm32-unknown-unknown with import-memory, address 0 is the start of linear memory.
    let base_ptr = crate::SAFETY_BUFFER as *mut crate::SigmaMatrix;
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

        for i in 1..crate::MAX_ATOMS {
            if state.matrix.ids[i] != 0 {
                state.matrix.roles[i] &= !(crate::AtomRole::MetazoanFlag as u8);
                state.matrix.evolution_reserved[i] = 0;
            }
        }

        let mut rings: Vec<Vec<usize>> = Vec::new();

        for start_node in 1..crate::MAX_ATOMS {
            if state.matrix.ids[start_node] == 0 || visited[start_node] == 1 {
                continue;
            }

            let mut path = Vec::with_capacity(8);
            path.push(start_node);

            fn dfs(
                current: usize,
                start: usize,
                depth: usize,
                path: &mut Vec<usize>,
                state: &crate::SigmaState,
            ) -> bool {
                if depth >= 8 {
                    return false;
                }

                for b_slot in 0..4 {
                    let target = state.matrix.bonds[(current * 4) + b_slot] as usize;
                    if target > 0
                        && target < crate::MAX_ATOMS
                        && state.matrix.ids[target] != 0
                    {
                        if target == start && depth >= 2 {
                            return true;
                        }
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
                    visited[node] = 1;
                }
            }
        }

        for ring in &rings {
            let count = ring.len() as i32;
            let mut sum_energy: i64 = 0;
            let mut sum_resonance: i64 = 0;

            for &node in ring {
                sum_energy += state.matrix.energy[node] as i64;
                sum_resonance += state.matrix.resonance[node] as i64;
                state.matrix.roles[node] |= crate::AtomRole::MetazoanFlag as u8;
            }

            let avg_energy = (sum_energy / count as i64) as i32;
            let avg_resonance = (sum_resonance / count as i64) as i32;
            let total_resonance = sum_resonance as i32;

            for &node in ring {
                state.matrix.energy[node] = avg_energy;
                state.matrix.resonance[node] = avg_resonance;
                state.matrix.evolution_reserved[node] = total_resonance;
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
pub extern "C" fn apply_metabolism_kernel(
    _param1: i32,
    _param2: i32,
    _param3: i32,
    _param4: i32,
    _param5: i32,
    _param6: i32,
    _param7: i32,
    _param8: i32,
    _param9: i32,
    _param10: i32,
    _param11: i32,
    _param12: i32,
) {
    // Implemented internally via `pulse.rs` `apply_metabolism_kernel`.
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