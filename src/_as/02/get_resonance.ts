/** SSoT: {@link ../../ontology/memory/get_resonance.md} */
import { RESONANCE_OFFSET } from "../01/mod";

@inline
export function get_resonance(idx: i32): i32 {
return load<i32>(RESONANCE_OFFSET + (idx << 2));
}
