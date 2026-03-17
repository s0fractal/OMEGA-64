// SSoT: file:///Users/s0fractal/OMEGA/I/memory/get_logic_byte.md
import { LOGIC_OFFSET } from "../01/mod";

@inline
export function get_logic_byte(idx: i32, slot: i32): u8 {
return load<u8>(LOGIC_OFFSET + (idx << 3) + slot);
}
