//! Instruction Set Architecture for Sigma-Core

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum GlyphOp {
    Nop = 0x00,
    Set = 0x01,
    Get = 0x02,
    Put = 0x03,
    Add = 0x04,
    Sub = 0x05,
    Jz = 0x10,
    Jnz = 0x11,
    Jmp = 0x12,
    // Future syscalls
    Syscall = 0x60,
    Replicate = 0x80,
    Signal = 0x81,
    Bind = 0x82,
    Share = 0x83,
    Hebb = 0x8A,
    Fire = 0x8B,
    Decay = 0x91,
    Plug = 0xA4,
    Tensegrity = 0xA5,
    Collective = 0xA6,
    Build = 0xA8,
    Sense = 0xA9,
    SecretePlasmid = 0xAA,
    IncorporatePlasmid = 0xAB,
    Resolve = 0xB0,
    ResonateKuramoto = 0xB1,
    Unknown = 0xFF,
}

impl From<u8> for GlyphOp {
    fn from(val: u8) -> Self {
        match val {
            0x00 => GlyphOp::Nop,
            0x01 => GlyphOp::Set,
            0x02 => GlyphOp::Get,
            0x03 => GlyphOp::Put,
            0x04 => GlyphOp::Add,
            0x05 => GlyphOp::Sub,
            0x10 => GlyphOp::Jz,
            0x11 => GlyphOp::Jnz,
            0x12 => GlyphOp::Jmp,
            0x60 => GlyphOp::Syscall,
            0x80 => GlyphOp::Replicate,
            0x81 => GlyphOp::Signal,
            0x82 => GlyphOp::Bind,
            0x83 => GlyphOp::Share,
            0x8A => GlyphOp::Hebb,
            0x8B => GlyphOp::Fire,
            0x91 => GlyphOp::Decay,
            0xA4 => GlyphOp::Plug,
            0xA5 => GlyphOp::Tensegrity,
            0xA6 => GlyphOp::Collective,
            0xA8 => GlyphOp::Build,
            0xA9 => GlyphOp::Sense, // Structure Sense
            0xAA => GlyphOp::SecretePlasmid,
            0xAB => GlyphOp::IncorporatePlasmid,
            0xB0 => GlyphOp::Resolve,
            0xB1 => GlyphOp::ResonateKuramoto,
            _ => GlyphOp::Unknown,
        }
    }
}

pub const PROP_ENERGY: u8 = 0;
pub const PROP_RESONANCE: u8 = 1;
pub const PROP_X: u8 = 2;
pub const PROP_Y: u8 = 3;
pub const PROP_PHASE: u8 = 4;
pub const PROP_GRID_CHARGE: u8 = 7;
pub const PROP_QUORUM: u8 = 8;
pub const PROP_NEURAL_COHERENCE: u8 = 9;
pub const PROP_MEMORY: u8 = 10;
pub const PROP_CONSENSUS: u8 = 11;

pub const SYS_SPAWN: i32 = 4;
pub const SYS_BIND: i32 = 5;
pub const SYS_TRANSFER: i32 = 10;
pub const SYS_ATTRACT: i32 = 17;
pub const SYS_FOLD: i32 = 18;
