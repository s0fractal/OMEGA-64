// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_reg.md
import { CONTEXT_OFFSET } from "../01/mod";

@inline
export function get_reg(atomIdx: i32, reg: i32): i32 {
return load<i32>(CONTEXT_OFFSET + (atomIdx << 6) + (reg << 2));
}
