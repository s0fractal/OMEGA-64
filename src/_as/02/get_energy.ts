// SSoT: src/ontology/memory/get_energy.md
import { ENERGY_OFFSET } from "../01/mod";

@inline
export function get_energy(idx: i32): i32 {
return load<i32>(ENERGY_OFFSET + (idx << 2));
}
