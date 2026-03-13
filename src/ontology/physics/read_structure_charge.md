---
id: read_structure_charge
type: pure_fn
dataType: null
returns: i32
level: 1
args:
  cellIdx: i32
vars:
  - STRUCTURE_CHARGE_INTENT_OFF
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - read_structure_cell
description: Auto-recovered read_structure_charge
---

---
---

```rust
unimplemented!()
```

```typescript
const cellVal = read_structure_cell(cellIdx);
const baseCharge = (cellVal >> 16) & 0xFF;
const intentCharge = atomic.load<i32>(
  STRUCTURE_CHARGE_INTENT_OFF + (cellIdx << 2) as usize,
);
return intentCharge > baseCharge ? intentCharge : baseCharge;
```

```assemblyscript
const cellVal = read_structure_cell(cellIdx);
const baseCharge = (cellVal >> 16) & 0xFF;
const intentCharge = atomic.load<i32>(
  STRUCTURE_CHARGE_INTENT_OFF + (cellIdx << 2) as usize,
);
return intentCharge > baseCharge ? intentCharge : baseCharge;
```
