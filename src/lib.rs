// OMEGA-64 Master Rust Assembly
// Phase 56: Cargo Ascendancy
//
// This file acts as the unifying root for `cargo build`.
// It maps the historically scattered vector logic into a single coherent tree
// without aggressively flattening them out of their topological layers just yet.

#[path = "00/sigma_core/src/atom_role.rs"]
pub mod atom_role;
pub use atom_role::*;
#[path = "00/sigma_core/src/ontology_gen/mod.rs"]
pub mod ontology_gen;
pub use ontology_gen::L01::*;
#[path = "00/sigma_core/src/environment.rs"]
pub mod environment;
#[path = "00/sigma_core/src/glyph_transport.rs"]
pub mod glyph_transport;
#[path = "00/sigma_core/src/isa.rs"]
pub mod isa;
#[path = "00/sigma_core/src/math.rs"]
pub mod math;
use crate::ontology_gen::L02::{SigmaMatrix, SigmaState};

#[path = "00/sigma_core/src/vm.rs"]
pub mod vm;

pub mod memory {
    pub use crate::ontology_gen::L02::*;
}

pub use isa::GlyphOp;
pub use ontology_gen::L02::{SigmaMatrix as _, SigmaState as _};
pub use ontology_gen::L03::{PulseOrchestrator, run_shadow_simulation};
pub use vm::LambdaVM;
