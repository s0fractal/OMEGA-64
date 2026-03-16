// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_read_resonance.md
import { PHYSICS_READ_RESONANCE_OFF } from "../01/mod";

@inline
export function get_read_resonance(idx: i32): i32 {
return load<i32>(PHYSICS_READ_RESONANCE_OFF + (idx << 2));
}
