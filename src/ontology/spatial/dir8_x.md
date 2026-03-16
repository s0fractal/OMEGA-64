---
id: dir8_x
type: pure_fn
description: >-
  Resolve X-axis direction (-1, 0, 1) from 8-way compass index: 0=NW, 1=NE, 2=N,
  3=S, 4=W, 5=E, 6=SW, 7=SE
deps:
  - TYPES
args:
  'n': i32
returns: i32
tests:
  - - 0
    - -1
  - - 1
    - 1
  - - 2
    - 0
  - - 3
    - 0
---

### Rust
```rust
if n == 0 || n == 4 || n == 6 {
    -1
} else if n == 1 || n == 5 || n == 7 {
    1
} else {
    0
}
```

### TypeScript
```typescript
 0 

0 

0 

0 

if (n == 0 || n == 4 || n == 6) return -1;
if (n == 1 || n == 5 || n == 7) return 1;
return 0;
```

### AssemblyScript
```assemblyscript
if (n == 0 || n == 4 || n == 6) return -1;
if (n == 1 || n == 5 || n == 7) return 1;
return 0;
```
