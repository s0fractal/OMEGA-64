/** SSoT: {@link ../../ontology/spatial/clamp_world_x.md} */
import { WORLD_MAX_X, math_clamp } from "../00/mod";

@inline
export function clamp_world_x(x: i32): i32 {
return math_clamp(x, 0, WORLD_MAX_X);
}
