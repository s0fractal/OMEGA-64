---
id: get_genome_velocity_x
type: pure_fn
dataType: null
returns: i32
level: 1
args:
  idx: i32
deps:
  - OMEGA_MEMORY_LAYOUT
  - SYSTEM_CONSTANTS
  - get_logic_byte
description: Auto-recovered get_genome_velocity_x
---

---
---

```rust
unimplemented!()
```

```typescript
let vx: i32 = 0;
for (let b = 0; b < 2; b++) {
  let byte = get_logic_byte(idx, b);
  let hi = (byte >> 4) as i32;
  if (hi != 0) vx += (hi > 7 ? hi - 7 : hi - 8) * 3;
  let lo = (byte & 0x0F) as i32;
  if (lo != 0) vx += (lo > 7 ? lo - 7 : lo - 8) * 3;
}
return vx;
```

```assemblyscript
let vx: i32 = 0;
for (let b = 0; b < 2; b++) {
  let byte = get_logic_byte(idx, b);
  let hi = (byte >> 4) as i32;
  if (hi != 0) vx += (hi > 7 ? hi - 7 : hi - 8) * 3;
  let lo = (byte & 0x0F) as i32;
  if (lo != 0) vx += (lo > 7 ? lo - 7 : lo - 8) * 3;
}
return vx;
```
