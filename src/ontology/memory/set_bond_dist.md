---
id: set_bond_dist
type: pure_fn
description: Set bond stretch distance in u8 representation
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - BOND_DISTANCES_OFFSET
args:
  atomIdx: i32
  slot: i32
  dist: u8
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
dataView.setUint8(BOND_DISTANCES_OFFSET + (atomIdx << 2) + slot, dist);
```

### AssemblyScript
```assemblyscript
store<u8>(BOND_DISTANCES_OFFSET + (atomIdx << 2) + slot, dist);
```
