---
id: set_role
type: pure_fn
description: Write semantic role to an atom
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - ROLES_OFFSET
args:
  atomIdx: i32
  val: u8
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```


```typescript
dataView.setUint8(ROLES_OFFSET + atomIdx, val);
```


```assemblyscript
store<u8>(ROLES_OFFSET + atomIdx, val);
```
