// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_hormone.md
import { HORMONE_OFF } from "../01/mod";

@inline
export function get_hormone(id: i32): u16 {
return atomic.load<u16>(HORMONE_OFF + (id << 1));
}
