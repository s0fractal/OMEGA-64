/** SSoT: {@link ../../ontology/memory/get_bond_stiffness.md} */
import { STIFFNESS_OFFSET } from "../01/mod";

@inline
export function get_bond_stiffness(atomIdx: i32, slot: i32): f32 {
return load<f32>(STIFFNESS_OFFSET + (atomIdx << 4) + (slot << 2));
}
