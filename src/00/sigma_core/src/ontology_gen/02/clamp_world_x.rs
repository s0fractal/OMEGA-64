// SSoT: file:///Users/s0fractal/OMEGA/I/spatial/clamp_world_x.md
#![allow(unused_imports)]
use super::super::L01::*;

pub fn clamp_world_x(x: i32) -> i32 {
    math_clamp(x, 0, WORLD_MAX_X)
}
