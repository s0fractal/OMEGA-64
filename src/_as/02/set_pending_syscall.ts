/** SSoT: {@link ../../ontology/memory/set_pending_syscall.md} */
import { CONTEXT_OFFSET } from "../01/mod";

@inline
export function set_pending_syscall(atomIdx: i32, val: u8): void {
store<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 33, val);
}
