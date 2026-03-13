use super::super::L01::*;

pub fn clampWorldX(x: i32) -> i32 {
    math_clamp(x, 0, WORLD_MAX_X)
}
