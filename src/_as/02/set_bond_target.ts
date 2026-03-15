/** SSoT: {@link ../../ontology/memory/set_bond_target.md} */
import { BONDS_OFFSET } from "../01/mod";

@inline
export function set_bond_target(atomIdx: i32, slot: i32, targetIdx: i32): void {
store<i32>(BONDS_OFFSET + (atomIdx << 4) + (slot << 2), targetIdx);
}
