// SSoT: file:///Users/s0fractal/OMEGA/I/memory/get_lineage.md
import { LINEAGE_OFFSET } from "../01/mod";

@inline
export function get_lineage(idx: i32): u64 {
return load<u64>(LINEAGE_OFFSET + (idx << 3));
}
