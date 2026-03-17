---
id: add_resonance_delta
type: pure_fn
description: Atomic add to physics resonance delta array
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - RESONANCE_DELTA_OFF
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
  Atomics.add(resonanceDeltaView, idx, delta);
}
```


```assemblyscript
if (delta != 0) {
  atomic.add<i32>(RESONANCE_DELTA_OFF + (idx << 2), delta);
}
```
