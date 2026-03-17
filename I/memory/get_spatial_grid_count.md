---
id: get_spatial_grid_count
type: pure_fn
description: Read population density in a spatial cell
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - SPATIAL_GRID_OFFSET
  - GRID_W
args:
  gx: i32
  gy: i32
returns: i32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```


```typescript




const cellIdx = gy * GRID_W + gx;
return dataView.getInt32(SPATIAL_GRID_OFFSET + (cellIdx << 7), true);
```


```assemblyscript
let cellIdx = gy * GRID_W + gx;
return load<i32>(SPATIAL_GRID_OFFSET + (cellIdx << 7));
```
