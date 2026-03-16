// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/unpack_structure_charge.md
#![allow(unused_imports)]
use super::super::L05::*;

pub fn unpack_structure_charge(intent: i32) -> u32 {
    ((intent as u32) & 0x7F000000) >> 24
}
