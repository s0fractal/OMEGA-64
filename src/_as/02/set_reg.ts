// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/set_reg.md
import { CONTEXT_OFFSET } from "../01/mod";

@inline
export function set_reg(atomIdx: i32, reg: i32, val: i32): void {
store<i32>(CONTEXT_OFFSET + (atomIdx << 6) + (reg << 2), val);
}
