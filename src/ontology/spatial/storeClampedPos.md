---
id: storeClampedPos
type: pure_fn
description: "Store an atom's physical coordinates directly into shared memory with strict bounding enforcement"
deps: 
  - OMEGA_MEMORY_LAYOUT
  - clampWorldX
  - clampWorldY
vars:
  - XS_OFFSET
  - YS_OFFSET
  - clampWorldX
  - clampWorldY
args:
  idx: i32
  x: i32
  y: i32
returns: void
---

### Rust
```rust
// Requires mutable pointer to the SharedArray lattice not naturally bound to pure_fns yet.
// TODO: Extend DAG to inject &mut [i8] for memory mutating commands.
()
```

### TypeScript
```typescript
/*
This function mutates shared WASM buffer memory and assumes 'store<i16>' exists in the execution environment window.
AssemblyScript exports are intended to run natively. In Deno TS contexts this is ignored.
*/
return;
```

### AssemblyScript
```assemblyscript
store<i16>(XS_OFFSET + (<usize>idx << 1), <i16>clampWorldX(x));
store<i16>(YS_OFFSET + (<usize>idx << 1), <i16>clampWorldY(y));
```
