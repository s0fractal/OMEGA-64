---
id: set_bond_stiffness
type: pure_fn
description: Set atomic bond stiffness
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - STIFFNESS_OFFSET
args:
  atomIdx: i32
  slot: i32
  val: f32
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
dataView.setFloat32(STIFFNESS_OFFSET + (atomIdx << 4) + (slot << 2), val, true);
```

### AssemblyScript
```assemblyscript
store<f32>(STIFFNESS_OFFSET + (atomIdx << 4) + (slot << 2), val);
```
