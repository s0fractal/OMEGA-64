// SSoT: src/ontology/memory/genome_key16.md
import { LOGIC_OFFSET } from "../01/mod";

@inline
export function genome_key16(idx: i32): i32 {
const ptr = LOGIC_OFFSET + (idx << 3);
const b0 = load<u8>(ptr) as i32;
const b1 = load<u8>(ptr + 1) as i32;
return (b0 << 8) | b1;
}
