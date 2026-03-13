use super::super::L00::*;

pub fn inGrid(x: i32, y: i32) -> bool {
    x >= 0 && x < GRID_W && y >= 0 && y < GRID_H
}
