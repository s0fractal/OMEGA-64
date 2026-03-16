---
id: get_resonance
type: pure_fn
description: Read atom resonance from the layout
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - RESONANCE_OFFSET
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
return dataView.getInt32(RESONANCE_OFFSET + (idx << 2), true);
```

### AssemblyScript
```assemblyscript
return load<i32>(RESONANCE_OFFSET + (idx << 2));
```
