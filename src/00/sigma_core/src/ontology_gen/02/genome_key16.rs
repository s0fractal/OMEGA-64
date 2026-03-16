// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/genome_key16.md
#![allow(unused_imports)]
use super::super::L01::*;

pub fn genome_key16(state: &SigmaState, idx: i32) -> i32 {
    let b0 = state.matrix.logic[idx as usize][0] as i32;
    let b1 = state.matrix.logic[idx as usize][1] as i32;
    (b0 << 8) | b1
}
