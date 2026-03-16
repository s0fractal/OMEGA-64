// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/set_energy.md
import { ENERGY_OFFSET } from "../01/mod";

@inline
export function set_energy(idx: i32, val: i32): void {
store<i32>(ENERGY_OFFSET + (idx << 2), val);
}
