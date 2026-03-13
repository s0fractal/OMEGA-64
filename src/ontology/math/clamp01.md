---
id: clamp01
type: pure_fn
description: "Constrains a floating point number between 0.0 and 1.0 (inclusive)"
tags: []
deps: []
args:
  x: f64
returns: f64
tests:
  - [0.5, 0.5]
  - [-1.0, 0.0]
  - [2.5, 1.0]
  - [1.0, 1.0]
  - [0.0, 0.0]
---

### Rust
```rust
if x < 0.0 {
    0.0
} else if x > 1.0 {
    1.0
} else {
    x
}
```

### TypeScript
```typescript
if (x < 0) return 0;
if (x > 1) return 1;
return x;
```

### AssemblyScript
```assemblyscript
if (x < 0.0) return 0.0;
if (x > 1.0) return 1.0;
return x;
```
