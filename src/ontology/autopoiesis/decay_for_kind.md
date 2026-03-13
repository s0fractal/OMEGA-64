---
id: decay_for_kind
type: pure_fn
dataType: null
returns: i32
level: 1
args:
  kind: i32
  amplitude: i32
vars:
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - fast_abs
description: Auto-recovered decay_for_kind
---

---
---

```rust
unimplemented!()
```

```typescript
const absAmp = fast_abs(amplitude);
let decayAmt = 0;
if (kind == 2) { // PLASMID
  decayAmt = absAmp > 256 ? 3 : 1;
} else if (kind == 1) { // PHEROMONE
  decayAmt = absAmp > 64 ? 8 : 4;
} else {
  decayAmt = absAmp; // Fallback
}
return amplitude > 0 ? decayAmt : -decayAmt;
```

```assemblyscript
const absAmp = fast_abs(amplitude);
let decayAmt = 0;
if (kind == 2) { // PLASMID
  decayAmt = absAmp > 256 ? 3 : 1;
} else if (kind == 1) { // PHEROMONE
  decayAmt = absAmp > 64 ? 8 : 4;
} else {
  decayAmt = absAmp; // Fallback
}
return amplitude > 0 ? decayAmt : -decayAmt;
```
