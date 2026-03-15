/** SSoT: {@link ../../ontology/memory/get_p_c.md} */
import { CONTEXT_OFFSET } from "../01/mod";

@inline
export function get_p_c(atomIdx: i32): u8 {
return load<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 32);
}
