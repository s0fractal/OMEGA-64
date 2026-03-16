---
id: get_read_y
type: pure_fn
description: Read physics buffered atom Y coordinate from the layout
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - PHYSICS_READ_YS_OFF
args:
  idx: i32
returns: i16
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```


```typescript
return dataView.getInt16(PHYSICS_READ_YS_OFF + (idx << 1), true);
```


```assemblyscript
return load<i16>(PHYSICS_READ_YS_OFF + (idx << 1));
```
