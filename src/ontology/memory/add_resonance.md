---
id: add_resonance
type: pure_fn
description: Add a delta to atom resonance in the layout
deps:
  - OMEGA_MEMORY_LAYOUT
  - get_resonance
  - set_resonance
  - TYPES
vars:
  - get_resonance
  - set_resonance
args:
  idx: i32
  delta: i32
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```


```typescript
set_resonance(idx, get_resonance(idx) + delta);
```


```assemblyscript
set_resonance(idx, get_resonance(idx) + delta);
```
