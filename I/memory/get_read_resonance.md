---
id: get_read_resonance
type: pure_fn
description: Read physics buffered atom Resonance from the layout
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - PHYSICS_READ_RESONANCE_OFF
args:
  idx: i32
returns: i32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```


```typescript
return dataView.getInt32(PHYSICS_READ_RESONANCE_OFF + (idx << 2), true);
```


```assemblyscript
return load<i32>(PHYSICS_READ_RESONANCE_OFF + (idx << 2));
```
