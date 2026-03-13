---
id: GRID_METRICS
type: constants
description: "Derived spatial grid formulas evaluating bound capacities dynamically"
deps: [SYSTEM_CONSTANTS]
vars: [GRID_W, GRID_H, SPATIAL_CELL_SIZE]
values:
  GRID_CELLS: 
    expr: "GRID_W * GRID_H"
    type: usize
  WORLD_MAX_X: 
    expr: "(GRID_W * SPATIAL_CELL_SIZE) - 1"
    type: i32
  WORLD_MAX_Y: 
    expr: "(GRID_H * SPATIAL_CELL_SIZE) - 1"
    type: i32
---
