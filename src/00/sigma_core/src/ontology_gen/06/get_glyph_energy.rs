// SSoT: file:///Users/s0fractal/OMEGA/I/core/get_glyph_energy.md
#![allow(unused_imports)]
use super::super::L05::*;

pub fn get_glyph_energy(id: u8) -> u8 {
    GLYPH_ENERGY_LUT[(id & 63) as usize]
}
