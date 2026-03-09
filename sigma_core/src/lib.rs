pub mod bonding;
pub mod glyph_transport;
pub mod isa;
pub mod math;
pub mod memory;
pub mod replication;
pub mod spatial;
pub mod structure;
pub mod vm;

pub use isa::GlyphOp;
pub use memory::{SigmaMatrix, SigmaState};
pub use vm::LambdaVM;
