#![allow(unused_imports)]
use super::super::L00::*;

pub fn clamp_world_y(y: i32) -> i32 {
    math_clamp(y, 0, WORLD_MAX_Y)
}
