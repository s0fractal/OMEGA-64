// SSoT: src/ontology/memory/get_x.md
import { XS_OFFSET } from "../01/mod";

@inline
export function get_x(idx: i32): i16 {
return load<i16>(XS_OFFSET + (idx << 1));
}
