// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_hive_memory.md
import { HIVE_MEMORY_OFF } from "../01/mod";

@inline
export function get_hive_memory(addr: i32): u8 {
return load<u8>(HIVE_MEMORY_OFF + (addr & 1023));
}
