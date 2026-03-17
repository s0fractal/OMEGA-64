// SSoT: file:///Users/s0fractal/OMEGA/I/memory/set_p_c.md
import { CONTEXT_OFFSET } from "../01/mod";

@inline
export function set_p_c(atomIdx: i32, val: u8): void {
store<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 32, val);
}
