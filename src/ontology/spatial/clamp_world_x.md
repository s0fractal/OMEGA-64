---
id: clamp_world_x
type: pure_fn
description: Constrain an X coordinate to the absolute global bounds
deps:
  - SYSTEM_CONSTANTS
  - math_clamp
  - TYPES
vars:
  - WORLD_MAX_X
  - math_clamp
args:
  x: i32
returns: i32
tests:
  - - -5
    - 0
---

### Rust
```rust
math_clamp(x, 0, WORLD_MAX_X)
```

### TypeScript
```typescript
return math_clamp(x, 0, WORLD_MAX_X);
```

### AssemblyScript
```assemblyscript
return math_clamp(x, 0, WORLD_MAX_X);
```
