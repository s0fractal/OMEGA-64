---
id: set_reg
type: pure_fn
description: Write atomic execution register
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - CONTEXT_OFFSET
args:
  atomIdx: i32
  reg: i32
  val: i32
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
dataView.setInt32(CONTEXT_OFFSET + (atomIdx << 6) + (reg << 2), val, true);
```

### AssemblyScript
```assemblyscript
store<i32>(CONTEXT_OFFSET + (atomIdx << 6) + (reg << 2), val);
```
