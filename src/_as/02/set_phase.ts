// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/set_phase.md
import { PHASE_OFFSET } from "../01/mod";

@inline
export function set_phase(idx: i32, val: i32): void {
store<i32>(PHASE_OFFSET + (idx << 2), val);
}
