/** SSoT: {@link ../../ontology/memory/set_bond_dist.md} */
import { BOND_DISTANCES_OFFSET } from "../01/mod";

@inline
export function set_bond_dist(atomIdx: i32, slot: i32, dist: u8): void {
store<u8>(BOND_DISTANCES_OFFSET + (atomIdx << 2) + slot, dist);
}
