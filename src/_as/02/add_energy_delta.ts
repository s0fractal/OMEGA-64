/** SSoT: {@link ../../ontology/memory/add_energy_delta.md} */
import { ENERGY_DELTA_OFF } from "../01/mod";

@inline
export function add_energy_delta(idx: i32, delta: i32): void {
if (delta != 0) {
  atomic.add<i32>(ENERGY_DELTA_OFF + (idx << 2), delta);
}
}
