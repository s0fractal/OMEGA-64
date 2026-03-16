---
id: get_spatial_grid_atom
type: pure_fn
description: Read atom reference index at grid slot
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - SPATIAL_GRID_OFFSET
  - GRID_W
args:
  gx: i32
  gy: i32
  subIdx: i32
returns: i32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript




const cellIdx = gy * GRID_W + gx;
return dataView.getInt32(SPATIAL_GRID_OFFSET + (cellIdx << 7) + ((subIdx + 1) << 2), true);
```

### AssemblyScript
```assemblyscript
let cellIdx = gy * GRID_W + gx;
return load<i32>(
  SPATIAL_GRID_OFFSET + (cellIdx << 7) + ((subIdx + 1) << 2)
);
```
