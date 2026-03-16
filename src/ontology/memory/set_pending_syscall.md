---
id: set_pending_syscall
type: pure_fn
description: Set pending syscall flag for an atom
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - CONTEXT_OFFSET
args:
  atomIdx: i32
  val: u8
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
dataView.setUint8(CONTEXT_OFFSET + (atomIdx << 6) + 33, val);
```

### AssemblyScript
```assemblyscript
store<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 33, val);
```
