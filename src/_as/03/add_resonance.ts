// SSoT: file:///Users/s0fractal/OMEGA/I/memory/add_resonance.md
import { get_resonance, set_resonance } from "../02/mod";

@inline
export function add_resonance(idx: i32, delta: i32): void {
set_resonance(idx, get_resonance(idx) + delta);
}
