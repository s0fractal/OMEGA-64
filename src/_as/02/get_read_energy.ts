// SSoT: src/ontology/memory/get_read_energy.md
import { PHYSICS_READ_ENERGY_OFF } from "../01/mod";

@inline
export function get_read_energy(idx: i32): i32 {
return load<i32>(PHYSICS_READ_ENERGY_OFF + (idx << 2));
}
