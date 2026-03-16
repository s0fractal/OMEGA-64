---
id: set_bond_target
type: pure_fn
description: Write atom bond target by slot
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - BONDS_OFFSET
args:
  atomIdx: i32
  slot: i32
  targetIdx: i32
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
dataView.setInt32(BONDS_OFFSET + (atomIdx << 4) + (slot << 2), targetIdx, true);
```

### AssemblyScript
```assemblyscript
store<i32>(BONDS_OFFSET + (atomIdx << 4) + (slot << 2), targetIdx);
```
