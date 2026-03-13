---
id: drain_spawn_requests
type: pure_fn
dataType: null
returns: i32
level: 1
args:
  tick: i32
vars:
  - SPAWN_HEAD_OFF
  - SPAWN_DATA_OFF
  - SPAWN_MAX
  - SPAWN_SLOT
  - MAX_ATOMS
deps:
  - OMEGA_MEMORY_LAYOUT
  - GRID_METRICS
  - find_next_free_slot
  - seed_atom
description: Auto-recovered drain_spawn_requests
---

---
---

```rust
unimplemented!()
```

```typescript
const writeHead = atomic.load<i32>(SPAWN_HEAD_OFF);
const readHead = atomic.load<i32>(SPAWN_HEAD_OFF + 4);

let cursor = readHead;
const writeCursor = writeHead; // Don't modulo here, we modulo access
let spawned: i32 = 0;
let freeSearchCursor: i32 = 0;

while (cursor != writeCursor && spawned < 64) {
  const slotOff = SPAWN_DATA_OFF +
    ((cursor % SPAWN_MAX) * SPAWN_SLOT) as usize;
  const gLo = load<i32>(slotOff);
  if (gLo != 0) {
    const cx = load<i16>(slotOff + 8) as i32;
    const cy = load<i16>(slotOff + 10) as i32;
    const energyScaled = load<i32>(slotOff + 12);

    const freeIdx = find_next_free_slot(freeSearchCursor);
    if (freeIdx != -1) {
      const childId = (tick as i64) << 32 | (freeIdx as i64);
      seed_atom(
        freeIdx,
        childId,
        cx,
        cy,
        energyScaled,
        100,
        slotOff,
        slotOff + 16,
      );
      freeSearchCursor = (freeIdx + 1) % MAX_ATOMS;
    }
  }
  cursor++;
  spawned++;
}

atomic.store<i32>(SPAWN_HEAD_OFF + 4, cursor);
return spawned;
```

```assemblyscript
const writeHead = atomic.load<i32>(SPAWN_HEAD_OFF);
const readHead = atomic.load<i32>(SPAWN_HEAD_OFF + 4);

let cursor = readHead;
const writeCursor = writeHead; // Don't modulo here, we modulo access
let spawned: i32 = 0;
let freeSearchCursor: i32 = 0;

while (cursor != writeCursor && spawned < 64) {
  const slotOff = SPAWN_DATA_OFF +
    ((cursor % SPAWN_MAX) * SPAWN_SLOT) as usize;
  const gLo = load<i32>(slotOff);
  if (gLo != 0) {
    const cx = load<i16>(slotOff + 8) as i32;
    const cy = load<i16>(slotOff + 10) as i32;
    const energyScaled = load<i32>(slotOff + 12);

    const freeIdx = find_next_free_slot(freeSearchCursor);
    if (freeIdx != -1) {
      const childId = (tick as i64) << 32 | (freeIdx as i64);
      seed_atom(
        freeIdx,
        childId,
        cx,
        cy,
        energyScaled,
        100,
        slotOff,
        slotOff + 16,
      );
      freeSearchCursor = (freeIdx + 1) % MAX_ATOMS;
    }
  }
  cursor++;
  spawned++;
}

atomic.store<i32>(SPAWN_HEAD_OFF + 4, cursor);
return spawned;
```
