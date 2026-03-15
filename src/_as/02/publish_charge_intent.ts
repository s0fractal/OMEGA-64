// SSoT: src/ontology/physics/publish_charge_intent.md
import { STRUCTURE_CHARGE_INTENT_OFF, STRUCTURE_INTENT_SPIN_LIMIT, fast_max } from "../01/mod";

@inline
export function publish_charge_intent(cellIdx: i32, requestedCharge: i32): void {
const ptr = STRUCTURE_CHARGE_INTENT_OFF + (cellIdx << 2) as usize;
let charge = requestedCharge;
charge = fast_max(charge, 0);
if (charge > 255) charge = 255;

for (let spin = 0; spin < STRUCTURE_INTENT_SPIN_LIMIT; spin++) {
  const current = atomic.load<i32>(ptr);
  if (charge <= current) return;
  const observed = atomic.cmpxchg<i32>(ptr, current, charge);
  if (observed == current) return;
}
}
