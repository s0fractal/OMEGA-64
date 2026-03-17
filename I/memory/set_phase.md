---
id: set_phase
type: pure_fn
description: Write atom phase to the layout
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - PHASE_OFFSET
args:
  idx: i32
  val: i32
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```


```typescript
dataView.setInt32(PHASE_OFFSET + (idx << 2), val, true);
```


```assemblyscript
store<i32>(PHASE_OFFSET + (idx << 2), val);
```
