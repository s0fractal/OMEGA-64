// OMEGA-64 Master Rust Assembly
// Phase 56: Cargo Ascendancy
//
// This file acts as the unifying root for `cargo build`.
// It maps the historically scattered vector logic into a single coherent tree
// without aggressively flattening them out of their topological layers just yet.

#[path = "00/sigma_core/src/bonding.rs"]
pub mod bonding;
#[path = "00/sigma_core/src/constants.rs"]
pub mod constants;
#[path = "00/sigma_core/src/environment.rs"]
pub mod environment;
#[path = "00/sigma_core/src/ffi.rs"]
pub mod ffi;
#[path = "00/sigma_core/src/glyph_transport.rs"]
pub mod glyph_transport;
#[path = "00/sigma_core/src/isa.rs"]
pub mod isa;
#[path = "00/sigma_core/src/math.rs"]
pub mod math;
#[path = "00/sigma_core/src/memory.rs"]
pub mod memory;
#[path = "00/sigma_core/src/pulse.rs"]
pub mod pulse;
#[path = "00/sigma_core/src/replication.rs"]
pub mod replication;
#[path = "00/sigma_core/src/shadow.rs"]
pub mod shadow;
#[path = "00/sigma_core/src/spatial.rs"]
pub mod spatial;
#[path = "00/sigma_core/src/structure.rs"]
pub mod structure;
#[path = "00/sigma_core/src/vm.rs"]
pub mod vm;

pub use isa::GlyphOp;
pub use memory::{SigmaMatrix, SigmaState};
pub use pulse::PulseOrchestrator;
pub use shadow::run_shadow_simulation;
pub use vm::LambdaVM;
