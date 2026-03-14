---
id: publish_charge_intent
type: pure_fn
dataType: null
returns: void
level: 1
args:
  cellIdx: i32
  requestedCharge: i32
vars:
  - STRUCTURE_CHARGE_INTENT_OFF
  - STRUCTURE_INTENT_SPIN_LIMIT
deps:
  - OMEGA_MEMORY_LAYOUT
  - SYSTEM_CONSTANTS
  - fast_max
description: Auto-recovered publish_charge_intent
---

---
---

```rust
unimplemented!()
```

```typescript
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
```

```assemblyscript
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
```
