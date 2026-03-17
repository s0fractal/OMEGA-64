---
id: get_bond_stiffness
type: pure_fn
description: Read atomic bond stiffness
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - STIFFNESS_OFFSET
args:
  atomIdx: i32
  slot: i32
returns: f32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```


```typescript
return dataView.getFloat32(STIFFNESS_OFFSET + (atomIdx << 4) + (slot << 2), true);
```


```assemblyscript
return load<f32>(STIFFNESS_OFFSET + (atomIdx << 4) + (slot << 2));
```
