// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/publish_build_intent.md
import { STRUCTURE_INTENT_SPIN_LIMIT, STRUCTURE_INTENT_LOCK_BIT, STRUCTURE_INTENT_OWNER_MASK, STRUCTURE_BUILD_OWNER_OFF, STRUCTURE_BUILD_VALUE_OFF } from "../01/mod";

@inline
export function publish_build_intent(ownerAtomIdx: i32, cellIdx: i32, buildValue: i32): void {
const ownerPtr = STRUCTURE_BUILD_OWNER_OFF + (cellIdx << 2) as usize;
const valuePtr = STRUCTURE_BUILD_VALUE_OFF + (cellIdx << 2) as usize;
const ownerToken = ownerAtomIdx + 1;

for (let spin = 0; spin < STRUCTURE_INTENT_SPIN_LIMIT; spin++) {
  const snapshot = atomic.load<i32>(ownerPtr);
  if ((snapshot & STRUCTURE_INTENT_LOCK_BIT) != 0) continue;
  const winningOwner = snapshot & STRUCTURE_INTENT_OWNER_MASK;
  if (ownerToken < winningOwner) return;

  const observed = atomic.cmpxchg<i32>(
    ownerPtr,
    snapshot,
    snapshot | STRUCTURE_INTENT_LOCK_BIT,
  );
  if (observed != snapshot) continue;

  atomic.store<i32>(valuePtr, buildValue);
  // Release lock + set winner
  atomic.store<i32>(ownerPtr, ownerToken);
  return;
}
}
