---
id: find_next_free_slot
type: pure_fn
dataType: null
returns: i32
level: 1
args:
  start: i32
vars:
  - MAX_ATOMS
  - IDS_OFFSET
description: Auto-recovered find_next_free_slot
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




for (let i = 0; i < MAX_ATOMS; i++) {
  const idx = (start + i) % MAX_ATOMS;
  const idPtr = IDS_OFFSET + (idx << 3) as usize;
  if (load<i64>(idPtr) == 0) return idx;
}
return -1;
```

```assemblyscript
for (let i = 0; i < MAX_ATOMS; i++) {
  const idx = (start + i) % MAX_ATOMS;
  const idPtr = IDS_OFFSET + (idx << 3) as usize;
  if (load<i64>(idPtr) == 0) return idx;
}
return -1;
```
