// SSoT: file:///Users/s0fractal/OMEGA/I/math/fast_abs.md
#![allow(unused_imports)]
use super::super::L00::*;

pub fn fast_abs(v: i32) -> i32 {
    let mask = v >> 31;
    (v + mask) ^ mask
}
