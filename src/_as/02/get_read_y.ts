// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_read_y.md
import { PHYSICS_READ_YS_OFF } from "../01/mod";

@inline
export function get_read_y(idx: i32): i16 {
return load<i16>(PHYSICS_READ_YS_OFF + (idx << 1));
}
