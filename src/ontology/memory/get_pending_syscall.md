---
id: get_pending_syscall
type: pure_fn
description: Read pending syscall flag for an atom
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - CONTEXT_OFFSET
args:
  atomIdx: i32
returns: u8
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getUint8(CONTEXT_OFFSET + (atomIdx << 6) + 33);
```

### AssemblyScript
```assemblyscript
return load<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 33);
```
