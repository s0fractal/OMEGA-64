// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/spatial/in_grid.md
#![allow(unused_imports)]
use super::super::L00::*;

pub fn in_grid(x: i32, y: i32) -> bool {
    x >= 0 && x < GRID_W && y >= 0 && y < GRID_H
}
