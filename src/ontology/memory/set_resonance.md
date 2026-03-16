---
id: set_resonance
type: pure_fn
description: Write atom resonance to the layout
deps:
  - OMEGA_MEMORY_LAYOUT
  - clamp_resource
  - TYPES
vars:
  - RESONANCE_OFFSET
  - clamp_resource
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
dataView.setInt32(RESONANCE_OFFSET + (idx << 2), clamp_resource(BigInt(val)), true);
```


```assemblyscript
store<i32>(RESONANCE_OFFSET + (idx << 2), clamp_resource(val as i64));
```
