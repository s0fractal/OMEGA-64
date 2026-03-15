/** SSoT: {@link ../../ontology/memory/set_hive_memory.md} */
import { HIVE_MEMORY_OFF } from "../01/mod";

@inline
export function set_hive_memory(addr: i32, val: u8): void {
store<u8>(HIVE_MEMORY_OFF + (addr & 1023), val);
}
