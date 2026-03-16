// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/sigma_isa.md
// Substrate Node: sigma_isa
// Level: 0
// Defines the Instruction Set Architecture values for the interpreter.

#![allow(unused_imports)]

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