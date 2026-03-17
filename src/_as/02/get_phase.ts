// SSoT: file:///Users/s0fractal/OMEGA/I/memory/get_phase.md
import { PHASE_OFFSET } from "../01/mod";

@inline
export function get_phase(idx: i32): i32 {
return load<i32>(PHASE_OFFSET + (idx << 2));
}
