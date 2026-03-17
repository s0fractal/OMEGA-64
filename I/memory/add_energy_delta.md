---
id: add_energy_delta
type: pure_fn
description: Atomic add to physics energy delta array
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - ENERGY_DELTA_OFF
args:
  idx: i32
  delta: i32
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```


```typescript
if (delta !== 0) {
  Atomics.add(energyDeltaView, idx, delta);
}
```


```assemblyscript
if (delta != 0) {
  atomic.add<i32>(ENERGY_DELTA_OFF + (idx << 2), delta);
}
```
