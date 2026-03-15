/** SSoT: {@link ../../ontology/physics/read_structure_cell.md} */
import { STRUCTURE_BUILD_OWNER_OFF, STRUCTURE_BUILD_VALUE_OFF, STRUCTURE_GRID_OFF, STRUCTURE_INTENT_SPIN_LIMIT, STRUCTURE_INTENT_LOCK_BIT, STRUCTURE_INTENT_OWNER_MASK } from "../01/mod";

@inline
export function read_structure_cell(cellIdx: i32): i32 {
const ownerPtr = STRUCTURE_BUILD_OWNER_OFF + (cellIdx << 2) as usize;
const valuePtr = STRUCTURE_BUILD_VALUE_OFF + (cellIdx << 2) as usize;
const gridPtr = STRUCTURE_GRID_OFF + (cellIdx << 2) as usize;

for (let spin = 0; spin < STRUCTURE_INTENT_SPIN_LIMIT; spin++) {
  const ownerRaw = atomic.load<i32>(ownerPtr);
  if ((ownerRaw & STRUCTURE_INTENT_LOCK_BIT) != 0) continue;
  if ((ownerRaw & STRUCTURE_INTENT_OWNER_MASK) != 0) {
    return atomic.load<i32>(valuePtr);
  }
  return atomic.load<i32>(gridPtr);
}

// Stale lock fallback: preserve forward progress under adversarial contention.
return atomic.load<i32>(gridPtr);
}
