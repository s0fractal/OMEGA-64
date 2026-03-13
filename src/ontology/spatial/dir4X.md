---
id: dir4X
type: pure_fn
description: "Resolve cardinal X-axis direction (-1, 0, 1) from 4-way compass index: 0=West, 1=East"
deps: []
args:
  n: i32
returns: i32
tests:
  - [0, -1]
  - [1, 1]
  - [2, 0]
  - [3, 0]
---

### Rust
```rust
if n == 0 {
    -1
} else if n == 1 {
    1
} else {
    0
}
```

### TypeScript
```typescript
if (n == 0) return -1;
if (n == 1) return 1;
return 0;
```

### AssemblyScript
```assemblyscript
if (n == 0) return -1;
if (n == 1) return 1;
return 0;
```
