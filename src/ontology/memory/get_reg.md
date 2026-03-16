---
id: get_reg
type: pure_fn
description: Read atomic execution register
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - CONTEXT_OFFSET
args:
  atomIdx: i32
  reg: i32
returns: i32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getInt32(CONTEXT_OFFSET + (atomIdx << 6) + (reg << 2), true);
```

### AssemblyScript
```assemblyscript
return load<i32>(CONTEXT_OFFSET + (atomIdx << 6) + (reg << 2));
```
