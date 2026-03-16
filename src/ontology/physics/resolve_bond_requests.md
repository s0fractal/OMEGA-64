---
id: resolve_bond_requests
type: pure_fn
dataType: null
returns: void
level: 1
args:
  start: i32
  end: i32
vars:
  - BOND_REQUESTS_OFFSET
  - MAX_ATOMS
deps:
  - OMEGA_MEMORY_LAYOUT
  - SYSTEM_CONSTANTS
  - set_bond_target
  - set_bond_stiffness
  - get_bond_target
  - TYPES
description: Auto-recovered resolve_bond_requests
---

---
---

```rust
unimplemented!()
```

```typescript
 i32 

i32 

i32 

i32 

let resolved: i32 = 0;
for (let i = start; i < end; i++) {
  const ptr = BOND_REQUESTS_OFFSET + (i * 12) as usize;
  const initiatorPlus1 = atomic.load<i32>(ptr);
  if (initiatorPlus1 == 0) continue;

  if (atomic.load<i32>(ptr + 8) != 1) { // Not active
    atomic.store<i32>(ptr, 0);
    continue;
  }

  const targetPlus1 = atomic.load<i32>(ptr + 4);
  const initiator = initiatorPlus1 - 1;
  const target = targetPlus1 - 1;

  if (target >= 0 && target < MAX_ATOMS) {
    // trace_atom(initiator, 0xBB, target, 0, resolved);
    set_bond_target(initiator, 0, target);
    set_bond_stiffness(initiator, 0, 0.1);
    set_bond_target(target, 1, initiator);
    set_bond_stiffness(target, 1, 0.1);
    // trace_atom(initiator, 0xCC, get_bond_target(initiator, 0), 0, 0);
    resolved++;
  }

  // Clear request
  atomic.store<i32>(ptr, 0);
  atomic.store<i32>(ptr + 4, 0);
  atomic.store<i32>(ptr + 8, 0);
}
// trace_atom(888, 0xEE, resolved, 0, 0);
return resolved;
```

```assemblyscript
let resolved: i32 = 0;
for (let i = start; i < end; i++) {
  const ptr = BOND_REQUESTS_OFFSET + (i * 12) as usize;
  const initiatorPlus1 = atomic.load<i32>(ptr);
  if (initiatorPlus1 == 0) continue;

  if (atomic.load<i32>(ptr + 8) != 1) { // Not active
    atomic.store<i32>(ptr, 0);
    continue;
  }

  const targetPlus1 = atomic.load<i32>(ptr + 4);
  const initiator = initiatorPlus1 - 1;
  const target = targetPlus1 - 1;

  if (target >= 0 && target < MAX_ATOMS) {
    // trace_atom(initiator, 0xBB, target, 0, resolved);
    set_bond_target(initiator, 0, target);
    set_bond_stiffness(initiator, 0, 0.1);
    set_bond_target(target, 1, initiator);
    set_bond_stiffness(target, 1, 0.1);
    // trace_atom(initiator, 0xCC, get_bond_target(initiator, 0), 0, 0);
    resolved++;
  }

  // Clear request
  atomic.store<i32>(ptr, 0);
  atomic.store<i32>(ptr + 4, 0);
  atomic.store<i32>(ptr + 8, 0);
}
// trace_atom(888, 0xEE, resolved, 0, 0);
return resolved;
```
