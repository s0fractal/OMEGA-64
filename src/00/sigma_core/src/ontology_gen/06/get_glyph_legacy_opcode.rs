// SSoT: src/ontology/core/get_glyph_legacy_opcode.md
#![allow(unused_imports)]
use super::super::L05::*;

pub fn get_glyph_legacy_opcode(id: u8) -> u8 {
    GLYPH_LEGACY_OPCODE_LUT[(id & 63) as usize]
}
