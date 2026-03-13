use super::super::L01::*;

pub fn clampWorldY(y: i32) -> i32 {
    math_clamp(y, 0, WORLD_MAX_Y)
}
