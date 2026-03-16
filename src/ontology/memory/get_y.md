---
id: get_y
type: pure_fn
description: Read atom Y coordinate from the layout
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - YS_OFFSET
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
return dataView.getInt16(YS_OFFSET + (idx << 1), true);
```

### AssemblyScript
```assemblyscript
return load<i16>(YS_OFFSET + (idx << 1));
```
