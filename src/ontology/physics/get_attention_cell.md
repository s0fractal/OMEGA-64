---
id: get_attention_cell
type: pure_fn
dataType: null
returns: f32
level: 1
args:
  gx: i32
  gy: i32
vars:
  - GRID_W
  - GRID_H
  - ATTENTION_FIELD_OFF
description: Auto-recovered get_attention_cell
deps:
  - SYSTEM_CONSTANTS
  - OMEGA_MEMORY_LAYOUT
  - TYPES
---

---
---

```rust
unimplemented!()
```

```typescript
 0 

0 

0 

0 

if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return 0.0;
return load<f32>(ATTENTION_FIELD_OFF + ((gy * GRID_W + gx) << 2) as usize);
```

```assemblyscript
if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return 0.0;
return load<f32>(ATTENTION_FIELD_OFF + ((gy * GRID_W + gx) << 2) as usize);
```
