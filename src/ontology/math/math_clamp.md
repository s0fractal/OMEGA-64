---
id: math_clamp
type: pure_fn
description: Universal boundary enforcement function
deps:
  - TYPES
args:
  val: i32
  min: i32
  max: i32
returns: i32
tests:
  - - 50
    - 0
    - 100
    - 50
  - - -10
    - 0
    - 100
    - 0
  - - 150
    - 0
    - 100
    - 100
---

### Rust
```rust
if val < min {
} else if val > max {
} else {
}
```

### TypeScript
```typescript




if (val < min) return min;
if (val > max) return max;
return val;
```

### AssemblyScript
```assemblyscript
if (val < min) return min;
if (val > max) return max;
return val;
```
