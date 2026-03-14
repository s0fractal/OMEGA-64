---
id: clamp_world_y
type: pure_fn
description: "Constrain a Y coordinate to the absolute global bounds"
deps: 
  - SYSTEM_CONSTANTS
  - math_clamp
vars:
  - WORLD_MAX_Y
  - math_clamp
args:
  y: i32
returns: i32
tests:
  - [-5, 0]
---

### Rust
```rust
math_clamp(y, 0, WORLD_MAX_Y)
```

### TypeScript
```typescript
return math_clamp(y, 0, WORLD_MAX_Y);
```

### AssemblyScript
```assemblyscript
return math_clamp(y, 0, WORLD_MAX_Y);
```
