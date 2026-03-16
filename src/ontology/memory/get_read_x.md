---
id: get_read_x
type: pure_fn
description: Read physics buffered atom X coordinate from the layout
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - PHYSICS_READ_XS_OFF
args:
  idx: i32
returns: i16
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getInt16(PHYSICS_READ_XS_OFF + (idx << 1), true);
```

### AssemblyScript
```assemblyscript
return load<i16>(PHYSICS_READ_XS_OFF + (idx << 1));
```
