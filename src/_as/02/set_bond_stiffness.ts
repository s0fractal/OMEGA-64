// SSoT: src/ontology/memory/set_bond_stiffness.md
import { STIFFNESS_OFFSET } from "../01/mod";

@inline
export function set_bond_stiffness(atomIdx: i32, slot: i32, val: f32): void {
store<f32>(STIFFNESS_OFFSET + (atomIdx << 4) + (slot << 2), val);
}
