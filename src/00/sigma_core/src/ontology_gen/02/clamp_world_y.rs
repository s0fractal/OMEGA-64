#[allow(unused_imports)]
use super::super::L01::*;

pub fn clamp_world_y(y: i32) -> i32 {
    math_clamp(y, 0, WORLD_MAX_Y)
}
