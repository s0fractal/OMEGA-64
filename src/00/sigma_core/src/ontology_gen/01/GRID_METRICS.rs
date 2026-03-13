use super::super::L00::*;

// Constants: GRID_METRICS
pub const GRID_CELLS: usize = (GRID_W * GRID_H) as usize;
pub const WORLD_MAX_X: i32 = ((GRID_W * SPATIAL_CELL_SIZE) - 1) as i32;
pub const WORLD_MAX_Y: i32 = ((GRID_H * SPATIAL_CELL_SIZE) - 1) as i32;
