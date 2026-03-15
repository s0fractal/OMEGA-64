// SSoT: src/ontology/memory/set_damping.md
import { DAMPING_OFF } from "../01/mod";

@inline
export function set_damping(atomIdx: i32, val: u8): void {
store<u8>(DAMPING_OFF + atomIdx, val);
}
