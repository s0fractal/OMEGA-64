---
id: fast_sign
type: pure_fn
description: "Bitwise mathematical sign extraction (-1, 0, 1) without branching"
deps: []
args:
  v: i32
returns: i32
tests:
  - [50, 1]
  - [-10, -1]
  - [0, 0]
---

### Rust
```rust
(v >> 31) | ((-v as u32) >> 31) as i32
```

### TypeScript
```typescript
return (v >> 31) | ((<number><unknown>-v) >>> 31);
```

### AssemblyScript
```assemblyscript
return (v >> 31) | (<i32>(<u32>-v) >>> 31);
```
