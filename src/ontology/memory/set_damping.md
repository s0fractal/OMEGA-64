---
id: set_damping
type: pure_fn
description: Set atomic kinetic damping factor
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - DAMPING_OFF
args:
  atomIdx: i32
  val: u8
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
dataView.setUint8(DAMPING_OFF + atomIdx, val);
```

### AssemblyScript
```assemblyscript
store<u8>(DAMPING_OFF + atomIdx, val);
```
