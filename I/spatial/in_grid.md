---
id: in_grid
type: pure_fn
description: Verify if provided coordinates fall within the topological cell grid bounds
deps:
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - GRID_W
  - GRID_H
args:
  x: i32
  'y': i32
returns: boolean
tests:
  - - -1
    - 5
    - false
  - - 5
    - -1
    - false
---

### Rust
```rust
x >= 0 && x < GRID_W && y >= 0 && y < GRID_H
```


```typescript




return x >= 0 && x < GRID_W && y >= 0 && y < GRID_H;
```


```assemblyscript
return x >= 0 && x < GRID_W && y >= 0 && y < GRID_H;
```
