---
id: fast_abs
type: pure_fn
description: "Bitwise fast absolute value calculation utilizing sign-masking without branching (i32)"
deps: []
args:
  v: i32
returns: i32
tests:
  - [50, 50]
  - [-10, 10]
  - [0, 0]
---

### Rust
```rust
let mask = v >> 31;
(v + mask) ^ mask
```

### TypeScript
```typescript
const mask = v >> 31;
return (v + mask) ^ mask;
```

### AssemblyScript
```assemblyscript
const mask = v >> 31;
return (v + mask) ^ mask;
```
