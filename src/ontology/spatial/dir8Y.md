---
id: dir8Y
type: pure_fn
description: "Resolve Y-axis direction (-1, 0, 1) from 8-way compass index"
deps: []
args:
  n: i32
returns: i32
tests:
  - [2, -1]
  - [4, -1]
  - [5, -1]
  - [3, 1]
  - [6, 1]
  - [7, 1]
---

### Rust
```rust
if n == 2 || n == 4 || n == 5 {
    -1
} else if n == 3 || n == 6 || n == 7 {
    1
} else {
    0
}
```

### TypeScript
```typescript
if (n == 2 || n == 4 || n == 5) return -1;
if (n == 3 || n == 6 || n == 7) return 1;
return 0;
```

### AssemblyScript
```assemblyscript
if (n == 2 || n == 4 || n == 5) return -1;
if (n == 3 || n == 6 || n == 7) return 1;
return 0;
```
