---
id: get_p_c
type: pure_fn
description: Read program counter of an atom
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
return dataView.getUint8(CONTEXT_OFFSET + (atomIdx << 6) + 32);
```

### AssemblyScript
```assemblyscript
return load<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 32);
```
