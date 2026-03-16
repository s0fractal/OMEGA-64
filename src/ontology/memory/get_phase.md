---
id: get_phase
type: pure_fn
description: Read atom phase from the layout
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - PHASE_OFFSET
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
return dataView.getInt32(PHASE_OFFSET + (idx << 2), true);
```

### AssemblyScript
```assemblyscript
return load<i32>(PHASE_OFFSET + (idx << 2));
```
