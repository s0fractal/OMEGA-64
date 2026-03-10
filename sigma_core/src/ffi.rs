#![allow(non_snake_case)]
use crate::memory::SigmaState;
use std::mem::ManuallyDrop;

// The Deno `SharedArrayBuffer` uses real pointers but from JS the offset starts at 0.
// `SAFETY_BUFFER` ends at exactly 7,999,992.
// `SigmaMatrix` now begins natively at `tick_counter` (offset 7,999,992 in the Deno memory map).
// By taking the 0-indexed memory pointer from WASM + 7,999,992 bytes,
// we alias directly onto our Struct matching JS indices perfectly.

const WASM_MEMORY_OFFSET: usize = 7_999_992;

/// Creates a safely wrapped `SigmaState` mapping to the imported `SharedArrayBuffer`.
/// `ManuallyDrop` prevents Rust from trying to deallocate the imported WASM memory when `SigmaState` correctly orchestrates its execution horizon and drops.
unsafe fn get_ffi_state() -> ManuallyDrop<SigmaState> {
    // In wasm32-unknown-unknown with import-memory, address 0 is the start of linear memory.
    let base_ptr = WASM_MEMORY_OFFSET as *mut crate::memory::SigmaMatrix;
    let state = SigmaState {
        matrix: unsafe { Box::from_raw(base_ptr) },
    };
    ManuallyDrop::new(state)
}

#[unsafe(no_mangle)]
pub extern "C" fn execute_atom(idx: usize) {
    let mut state = unsafe { get_ffi_state() };
    let mut vm = crate::vm::LambdaVM::new();
    vm.step(&mut state, idx);
}

#[unsafe(no_mangle)]
pub extern "C" fn tick_environment(tick: u32) {
    let mut state = unsafe { get_ffi_state() };
    crate::environment::tick_environment(&mut state, tick as i32);
}

#[unsafe(no_mangle)]
pub extern "C" fn tick_matrix() {
    let mut state = unsafe { get_ffi_state() };
    // Assuming mapping to pulse double buffering of coords natively:
    // (This existed in JS before pulse.rs orchestrator took over in Rust)
    // For now we'll do nothing, as PulseOrchestrator handles this.
}

#[unsafe(no_mangle)]
pub extern "C" fn tick_structure_grid() {
    let mut state = unsafe { get_ffi_state() };
    crate::environment::tick_structure_grid(&mut state);
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
    let mut state = unsafe { get_ffi_state() };
    state.matrix.neural_coherence
}

#[unsafe(no_mangle)]
pub extern "C" fn set_neural_coherence(val: i32) {
    let mut state = unsafe { get_ffi_state() };
    state.matrix.neural_coherence = val;
}

#[unsafe(no_mangle)]
pub extern "C" fn tickGlyphTransport(_tick: u32) {
    let mut state = unsafe { get_ffi_state() };
    crate::environment::tick_glyph_transport(&mut state);
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
    param1: i32,
    param2: i32,
    param3: i32,
    param4: i32,
    param5: i32,
    param6: i32,
    param7: i32,
    param8: i32,
    param9: i32,
    param10: i32,
    param11: i32,
    param12: i32,
) {
    // The AssemblyScript runtime expected explicit values passed in,
    // but in Rust `SigmaState` reads these directly from the `hormones` array fields.
    // Implemented internally via `pulse.rs` `apply_metabolism_kernel`.
}
