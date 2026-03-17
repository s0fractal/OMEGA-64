// SSoT: file:///Users/s0fractal/OMEGA/I/memory/get_spatial_grid_count.md
import { SPATIAL_GRID_OFFSET, GRID_W } from "../01/mod";

@inline
export function get_spatial_grid_count(gx: i32, gy: i32): i32 {
let cellIdx = gy * GRID_W + gx;
return load<i32>(SPATIAL_GRID_OFFSET + (cellIdx << 7));
}
