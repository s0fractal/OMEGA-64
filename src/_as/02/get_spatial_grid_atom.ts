// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_spatial_grid_atom.md
import { SPATIAL_GRID_OFFSET, GRID_W } from "../01/mod";

@inline
export function get_spatial_grid_atom(gx: i32, gy: i32, subIdx: i32): i32 {
let cellIdx = gy * GRID_W + gx;
return load<i32>(
  SPATIAL_GRID_OFFSET + (cellIdx << 7) + ((subIdx + 1) << 2)
);
}
