---
id: fast_min
type: pure_fn
description: "Bitwise fast minimum calculation utilizing difference-masking without branching (i32)"
deps: []
args:
  a: i32
  b: i32
returns: i32
tests:
  - [50, 20, 20]
  - [-10, 0, -10]
  - [10, 10, 10]
---

### Rust
```rust
let diff = a - b;
b + (diff & (diff >> 31))
```

### TypeScript
```typescript
const diff = a - b;
return b + (diff & (diff >> 31));
```

### AssemblyScript
```assemblyscript
const diff = a - b;
return b + (diff & (diff >> 31));
```
