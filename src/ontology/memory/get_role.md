---
id: get_role
type: pure_fn
description: Read semantic role of an atom
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - ROLES_OFFSET
args:
  atomIdx: i32
returns: u8
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```


```typescript
return dataView.getUint8(ROLES_OFFSET + atomIdx);
```


```assemblyscript
return load<u8>(ROLES_OFFSET + atomIdx);
```
