// OMEGA-64 Master Rust Assembly
// Phase 56: Cargo Ascendancy
//
// This file acts as the unifying root for `cargo build`.
// It maps the historically scattered vector logic into a single coherent tree
// without aggressively flattening them out of their topological layers just yet.

#[path = "00/sigma_core/src/ontology_gen/mod.rs"]
pub mod ontology_gen;

pub use ontology_gen::L00::*;
pub use ontology_gen::L01::*;
pub use ontology_gen::L02::*;
pub use ontology_gen::L03::*;
pub use ontology_gen::L04::*;
pub use ontology_gen::L05::*;
pub use ontology_gen::L06::*;

pub use ontology_gen::L02::{PulseOrchestrator, SigmaMatrix, SigmaState};

use std::sync::atomic::{AtomicPtr, Ordering};
use std::cell::RefCell;

static LATTICE_PTR: AtomicPtr<u8> = AtomicPtr::new(std::ptr::null_mut());

thread_local! {
    static VISITED_POOL: RefCell<Vec<u8>> = RefCell::new(vec![0u8; 500000]);
}

#[no_mangle]
pub extern "C" fn ffi_init(ptr: *mut u8) {
    LATTICE_PTR.store(ptr, Ordering::SeqCst);
}

#[no_mangle]
pub extern "C" fn ffi_tick(ptr: *mut u8, tick: u32) {
    let lattice = if ptr.is_null() {
        LATTICE_PTR.load(Ordering::SeqCst)
    } else {
        ptr
    };

    if lattice.is_null() { return; }

    // SAFETY_BUFFER = 8000000
    let matrix_ptr = unsafe { lattice.add(8000000) } as *mut SigmaMatrix;
    let mut state = unsafe { SigmaState::from_raw(matrix_ptr) };
    
    VISITED_POOL.with(|pool| {
        let mut visited = pool.borrow_mut();
        let mut orchestrator = PulseOrchestrator::new(&mut visited);
        orchestrator.tick(&mut state, tick);
    });

    // Prevent drop of shared memory wrapper
    std::mem::forget(state);
}
