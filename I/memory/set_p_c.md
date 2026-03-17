---
id: set_p_c
type: pure_fn
description: Set program counter of an atom
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


```typescript
dataView.setUint8(CONTEXT_OFFSET + (atomIdx << 6) + 32, val);
```


```assemblyscript
store<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 32, val);
```
