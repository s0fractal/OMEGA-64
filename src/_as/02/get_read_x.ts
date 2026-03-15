/** SSoT: {@link ../../ontology/memory/get_read_x.md} */
import { PHYSICS_READ_XS_OFF } from "../01/mod";

@inline
export function get_read_x(idx: i32): i16 {
return load<i16>(PHYSICS_READ_XS_OFF + (idx << 1));
}
