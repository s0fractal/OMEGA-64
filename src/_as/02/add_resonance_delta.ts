// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/add_resonance_delta.md
import { RESONANCE_DELTA_OFF } from "../01/mod";

@inline
export function add_resonance_delta(idx: i32, delta: i32): void {
if (delta != 0) {
  atomic.add<i32>(RESONANCE_DELTA_OFF + (idx << 2), delta);
}
}
