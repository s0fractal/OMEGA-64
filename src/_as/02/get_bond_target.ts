// SSoT: file:///Users/s0fractal/OMEGA/I/memory/get_bond_target.md
import { BONDS_OFFSET } from "../01/mod";

@inline
export function get_bond_target(atomIdx: i32, slot: i32): i32 {
return load<i32>(BONDS_OFFSET + (atomIdx << 4) + (slot << 2));
}
