// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_y.md
import { YS_OFFSET } from "../01/mod";

@inline
export function get_y(idx: i32): i16 {
return load<i16>(YS_OFFSET + (idx << 1));
}
