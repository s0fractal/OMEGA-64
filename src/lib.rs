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

pub use ontology_gen::L02::{SigmaMatrix, SigmaState};
// PulseOrchestrator and run_shadow_simulation should be exported correctly by the globs
// so we don't necessarily need explicit paths for them, unless required by old aliases.
