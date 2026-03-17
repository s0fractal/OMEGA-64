// SSoT: file:///Users/s0fractal/OMEGA/I/memory/get_x.md
import { XS_OFFSET } from "../01/mod";

@inline
export function get_x(idx: i32): i16 {
return load<i16>(XS_OFFSET + (idx << 1));
}
