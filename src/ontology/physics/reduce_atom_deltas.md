---
id: reduce_atom_deltas
type: pure_fn
dataType: null
returns: void
level: 1
args:
  startIdx: i32
  endIdx: i32
vars:
  - ENERGY_DELTA_OFF
  - ENERGY_OFFSET
  - RESONANCE_DELTA_OFF
  - RESONANCE_OFFSET
  - MAX_ATOMS
deps:
  - OMEGA_MEMORY_LAYOUT
  - clamp_resource
---

---
---

```rust
unimplemented!()
```

```typescript
```

```assemblyscript
  let start = startIdx;
  let end = endIdx;
  if (start < 0) start = 0;
  if (end > MAX_ATOMS) end = MAX_ATOMS;
  if (start >= end) return;

  for (let idx = start; idx < end; idx++) {
    const deltaOff = (idx << 2) as usize;

    const de = atomic.load<i32>(ENERGY_DELTA_OFF + deltaOff);
    if (de != 0) {
      atomic.store<i32>(ENERGY_DELTA_OFF + deltaOff, 0);
      const nextEnergy = (atomic.load<i32>(ENERGY_OFFSET + deltaOff) as i64) +
        (de as i64);
      atomic.store<i32>(ENERGY_OFFSET + deltaOff, clamp_resource(nextEnergy));
    }

    const dr = atomic.load<i32>(RESONANCE_DELTA_OFF + deltaOff);
    if (dr != 0) {
      atomic.store<i32>(RESONANCE_DELTA_OFF + deltaOff, 0);
      const nextRes = (atomic.load<i32>(RESONANCE_OFFSET + deltaOff) as i64) +
        (dr as i64);
      atomic.store<i32>(RESONANCE_OFFSET + deltaOff, clamp_resource(nextRes));
    }
  }
```
