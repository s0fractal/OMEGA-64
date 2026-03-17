// SSoT: file:///Users/s0fractal/OMEGA/I/memory/set_role.md
import { ROLES_OFFSET } from "../01/mod";

@inline
export function set_role(atomIdx: i32, val: u8): void {
store<u8>(ROLES_OFFSET + atomIdx, val);
}
