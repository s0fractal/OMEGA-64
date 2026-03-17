---
id: get_bond_target
type: pure_fn
description: Read atom bond target by slot
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - BONDS_OFFSET
args:
  atomIdx: i32
  slot: i32
returns: i32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```


```typescript
return dataView.getInt32(BONDS_OFFSET + (atomIdx << 4) + (slot << 2), true);
```


```assemblyscript
return load<i32>(BONDS_OFFSET + (atomIdx << 4) + (slot << 2));
```
