---
id: set_energy
type: pure_fn
description: Write atom energy to the layout
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - ENERGY_OFFSET
args:
  idx: i32
  val: i32
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```


```typescript




// Requires `dataView: DataView` in scope
dataView.setInt32(ENERGY_OFFSET + (idx << 2), val, true);
```


```assemblyscript
store<i32>(ENERGY_OFFSET + (idx << 2), val);
```
