---
id: diffusion_share_for_kind
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
description: Auto-recovered diffusion_share_for_kind
---

---
---

```rust
unimplemented!()
```

```typescript
const absAmp = fast_abs(amplitude);
let shareAmt = 0;
if (kind == 2) { // PLASMID
  shareAmt = absAmp >= 96 ? (absAmp >> 3) : 0; // * 0.125
} else if (kind == 1) { // PHEROMONE
  shareAmt = absAmp >= 24 ? (absAmp >> 2) : 0; // * 0.25
}
return amplitude > 0 ? shareAmt : -shareAmt;
```

```assemblyscript
const absAmp = fast_abs(amplitude);
let shareAmt = 0;
if (kind == 2) { // PLASMID
  shareAmt = absAmp >= 96 ? (absAmp >> 3) : 0; // * 0.125
} else if (kind == 1) { // PHEROMONE
  shareAmt = absAmp >= 24 ? (absAmp >> 2) : 0; // * 0.25
}
return amplitude > 0 ? shareAmt : -shareAmt;
```
