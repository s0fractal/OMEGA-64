// SSoT: file:///Users/s0fractal/OMEGA/I/math/math_clamp.md
#![allow(unused_imports)]
use super::super::L00::*;

pub fn math_clamp(val: i32, min: i32, max: i32) -> i32 {
    if val < min {
        min
    } else if val > max {
        max
    } else {
        val
    }
}
