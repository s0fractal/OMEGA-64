---
id: seed_atom
type: pure_fn
dataType: null
returns: void
level: 1
args:
  idx: i32
  id: i64
  x: i32
  y: i32
  energy: i32
  resonance: i32
  genomePtr: usize
  lineagePtr: usize
vars:
  - IDS_OFFSET
  - XS_OFFSET
  - YS_OFFSET
  - ENERGY_OFFSET
  - RESONANCE_OFFSET
  - PHASE_OFFSET
  - ROLES_OFFSET
  - LOGIC_OFFSET
  - LINEAGE_OFFSET
  - INSTRUCTIONS_OFFSET
  - CONTEXT_OFFSET
deps:
  - OMEGA_MEMORY_LAYOUT
  - SYSTEM_CONSTANTS
description: Auto-recovered seed_atom
---

---
---

```rust
unimplemented!()
```

```typescript
const idPtr = IDS_OFFSET + (idx << 3) as usize;
store<i64>(idPtr, id);

const xPtr = XS_OFFSET + (idx << 1) as usize;
store<i16>(xPtr, x as i16);

const yPtr = YS_OFFSET + (idx << 1) as usize;
store<i16>(yPtr, y as i16);

store<i32>(ENERGY_OFFSET + (idx << 2) as usize, energy);
store<i32>(RESONANCE_OFFSET + (idx << 2) as usize, resonance);
store<i32>(PHASE_OFFSET + (idx << 2) as usize, 0);
store<u8>(ROLES_OFFSET + (idx as usize), 0);

const logicPtr = LOGIC_OFFSET + (idx << 3) as usize;
if (genomePtr != 0) {
  memory.copy(logicPtr, genomePtr, 8);
} else {
  for (let b = 0; b < 8; b++) store<u8>(logicPtr + b, 0);
}

const linOff = LINEAGE_OFFSET + (idx << 3) as usize;
if (lineagePtr != 0) {
  memory.copy(linOff, lineagePtr, 8);
} else {
  store<i64>(linOff, 0);
}

// Clear instructions and context
const instPtr = INSTRUCTIONS_OFFSET + (idx << 6) as usize;
const ctxPtr = CONTEXT_OFFSET + (idx << 6) as usize;
for (let b = 0; b < 64; b++) {
  store<u8>(instPtr + b, 0);
  store<u8>(ctxPtr + b, 0);
}
```

```assemblyscript
const idPtr = IDS_OFFSET + (idx << 3) as usize;
store<i64>(idPtr, id);

const xPtr = XS_OFFSET + (idx << 1) as usize;
store<i16>(xPtr, x as i16);

const yPtr = YS_OFFSET + (idx << 1) as usize;
store<i16>(yPtr, y as i16);

store<i32>(ENERGY_OFFSET + (idx << 2) as usize, energy);
store<i32>(RESONANCE_OFFSET + (idx << 2) as usize, resonance);
store<i32>(PHASE_OFFSET + (idx << 2) as usize, 0);
store<u8>(ROLES_OFFSET + (idx as usize), 0);

const logicPtr = LOGIC_OFFSET + (idx << 3) as usize;
if (genomePtr != 0) {
  memory.copy(logicPtr, genomePtr, 8);
} else {
  for (let b = 0; b < 8; b++) store<u8>(logicPtr + b, 0);
}

const linOff = LINEAGE_OFFSET + (idx << 3) as usize;
if (lineagePtr != 0) {
  memory.copy(linOff, lineagePtr, 8);
} else {
  store<i64>(linOff, 0);
}

// Clear instructions and context
const instPtr = INSTRUCTIONS_OFFSET + (idx << 6) as usize;
const ctxPtr = CONTEXT_OFFSET + (idx << 6) as usize;
for (let b = 0; b < 64; b++) {
  store<u8>(instPtr + b, 0);
  store<u8>(ctxPtr + b, 0);
}
```
