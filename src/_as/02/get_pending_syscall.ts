// SSoT: src/ontology/memory/get_pending_syscall.md
import { CONTEXT_OFFSET } from "../01/mod";

@inline
export function get_pending_syscall(atomIdx: i32): u8 {
return load<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 33);
}
