---
id: fast_max
type: pure_fn
description: "Bitwise fast maximum calculation utilizing difference-masking without branching (i32)"
deps: []
args:
  a: i32
  b: i32
returns: i32
tests:
  - [50, 20, 50]
  - [-10, 0, 0]
  - [10, 10, 10]
---

### Rust
```rust
let diff = a - b;
a - (diff & (diff >> 31))
```

### TypeScript
```typescript
const diff = a - b;
return a - (diff & (diff >> 31));
```

### AssemblyScript
```assemblyscript
const diff = a - b;
return a - (diff & (diff >> 31));
```
