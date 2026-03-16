// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/spatial/in_grid.md
import { GRID_W, GRID_H } from "../00/mod";

@inline
export function in_grid(x: i32, y: i32): bool {
return x >= 0 && x < GRID_W && y >= 0 && y < GRID_H;
}
