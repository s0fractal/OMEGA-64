// SSoT: src/ontology/memory/set_resonance.md
import { RESONANCE_OFFSET, clamp_resource } from "../01/mod";

@inline
export function set_resonance(idx: i32, val: i32): void {
store<i32>(RESONANCE_OFFSET + (idx << 2), clamp_resource(val as i64));
}
