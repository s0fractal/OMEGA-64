---
id: set_hive_memory
type: pure_fn
description: "Write byte to the organism shared neural memory block"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - HIVE_MEMORY_OFF
args:
  addr: i32
  val: u8
returns: void
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
dataView.setUint8(HIVE_MEMORY_OFF + (addr & 1023), val);
```

### AssemblyScript
```assemblyscript
store<u8>(HIVE_MEMORY_OFF + (addr & 1023), val);
```
