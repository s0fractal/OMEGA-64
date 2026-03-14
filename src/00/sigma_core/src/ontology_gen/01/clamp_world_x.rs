#![allow(unused_imports)]
use super::super::L00::*;

pub fn clamp_world_x(x: i32) -> i32 {
    math_clamp(x, 0, WORLD_MAX_X)
}
