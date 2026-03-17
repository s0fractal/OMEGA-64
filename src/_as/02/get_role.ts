// SSoT: file:///Users/s0fractal/OMEGA/I/memory/get_role.md
import { ROLES_OFFSET } from "../01/mod";

@inline
export function get_role(atomIdx: i32): u8 {
return load<u8>(ROLES_OFFSET + atomIdx);
}
