/** SSoT: {@link ../../ontology/autopoiesis/find_next_free_slot.md} */
import { MAX_ATOMS, IDS_OFFSET } from "../01/mod";

@inline
export function find_next_free_slot(start: i32): i32 {
for (let i = 0; i < MAX_ATOMS; i++) {
  const idx = (start + i) % MAX_ATOMS;
  const idPtr = IDS_OFFSET + (idx << 3) as usize;
  if (load<i64>(idPtr) == 0) return idx;
}
return -1;
}
