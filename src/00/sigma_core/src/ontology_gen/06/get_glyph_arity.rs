// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/get_glyph_arity.md
#![allow(unused_imports)]
use super::super::L05::*;

pub fn get_glyph_arity(id: u8) -> u8 {
    GLYPH_ARITY_LUT[(id & 63) as usize]
}
