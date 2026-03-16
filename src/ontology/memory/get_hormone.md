---
id: get_hormone
type: pure_fn
description: Read global hormone level atomically
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - HORMONE_OFF
args:
  id: i32
returns: u16
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```


```typescript
return Atomics.load(HormoneView, id);
```


```assemblyscript
return atomic.load<u16>(HORMONE_OFF + (id << 1));
```
