---
id: dir4_y
type: pure_fn
description: >-
  Resolve cardinal Y-axis direction (-1, 0, 1) from 4-way compass index:
  2=North, 3=South
deps:
  - TYPES
args:
  'n': i32
returns: i32
tests:
  - - 0
    - 0
  - - 1
    - 0
  - - 2
    - -1
  - - 3
    - 1
---

### Rust
```rust
if n == 2 {
    -1
} else if n == 3 {
    1
} else {
    0
}
```

### TypeScript
```typescript




if (n == 2) return -1;
if (n == 3) return 1;
return 0;
```

### AssemblyScript
```assemblyscript
if (n == 2) return -1;
if (n == 3) return 1;
return 0;
```
