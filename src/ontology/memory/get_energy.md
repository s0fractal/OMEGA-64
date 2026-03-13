---
id: get_energy
type: pure_fn
description: "Read atom energy from the layout"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - ENERGY_OFFSET
args:
  idx: i32
returns: i32
---

### Rust
```rust
// Requires SharedArrayBuffer pointer mechanism in parent scope
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
// Requires `dataView: DataView` in scope
return dataView.getInt32(ENERGY_OFFSET + (idx << 2), true);
```

### AssemblyScript
```assemblyscript
return load<i32>(ENERGY_OFFSET + (idx << 2));
```
