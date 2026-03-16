---
id: encode_force_tuple
type: pure_fn
dataType: null
returns: void
level: 1
args:
  fx: f32
  fy: f32
description: Auto-recovered encode_force_tuple
deps:
  - TYPES
---

---
---

```rust
unimplemented!()
```

```typescript




// Reinterpret cast f32 -> i32 then pack into i64
const xInt = reinterpret<i32>(fx);
const yInt = reinterpret<i32>(fy);
return ((xInt as i64) << 32) | ((yInt as i64) & 0xFFFFFFFF);
```

```assemblyscript
// Reinterpret cast f32 -> i32 then pack into i64
const xInt = reinterpret<i32>(fx);
const yInt = reinterpret<i32>(fy);
return ((xInt as i64) << 32) | ((yInt as i64) & 0xFFFFFFFF);
```
