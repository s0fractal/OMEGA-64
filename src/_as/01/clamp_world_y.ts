// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/spatial/clamp_world_y.md
import { WORLD_MAX_Y, math_clamp } from "../00/mod";

@inline
export function clamp_world_y(y: i32): i32 {
return math_clamp(y, 0, WORLD_MAX_Y);
}
