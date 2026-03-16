---
id: run_phagocyte_pass
type: pure_fn
description: >-
  Iterates over the atom lattice and recycles any necrotic or drifting atoms in
  a single WASM call.
tags:
  - physics
  - autopoiesis
deps:
  - immune_check
  - get_read_energy
  - get_read_resonance
  - set_energy
  - set_resonance
  - TYPES
vars:
  - MAX_ATOMS
  - IDS_OFFSET
  - ROLES_OFFSET
  - BONDS_OFFSET
args:
  entropy_pressure: i32
returns: i32
optimization: hot
---
```typescript




// unimplemented for JS host since this is an AS WASM function
  return 0;
```

```assemblyscript
  let purgeCount: i32 = 0;
  for (let i: i32 = 1; i <= MAX_ATOMS; i++) {
    const id = atomic.load<i64>(IDS_OFFSET + (i << 3) as usize);
    if (id != 0) {
       const role = atomic.load<u8>(ROLES_OFFSET + i as usize);
       const energy = get_read_energy(i);
       const resonance = get_read_resonance(i);
       if (immune_check(energy, resonance, <i32>id, <u8>role, entropy_pressure)) {
         atomic.store<i64>(IDS_OFFSET + (i << 3) as usize, 0);
         atomic.store<u8>(ROLES_OFFSET + i as usize, 0);
         set_energy(i, 0);
         set_resonance(i, 0);
         const baseBond = BONDS_OFFSET + (i << 4) as usize;
         atomic.store<i32>(baseBond, 0);
         atomic.store<i32>(baseBond + 4, 0);
         atomic.store<i32>(baseBond + 8, 0);
         atomic.store<i32>(baseBond + 12, 0);
         purgeCount++;
       }
    }
  }
  return purgeCount;
```

```rust
  unimplemented!()
```
