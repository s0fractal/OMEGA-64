#![allow(unused_imports)]
use super::super::L05::*;

pub fn get_glyph_energy(id: u8) -> u8 {
    GLYPH_ENERGY_LUT[(id & 63) as usize]
}
