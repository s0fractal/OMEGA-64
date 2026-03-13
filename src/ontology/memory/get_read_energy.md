---
id: get_read_energy
type: pure_fn
description: "Read physics buffered atom Energy from the layout"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - PHYSICS_READ_ENERGY_OFF
args:
  idx: i32
returns: i32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getInt32(PHYSICS_READ_ENERGY_OFF + (idx << 2), true);
```

### AssemblyScript
```assemblyscript
return load<i32>(PHYSICS_READ_ENERGY_OFF + (idx << 2));
```
