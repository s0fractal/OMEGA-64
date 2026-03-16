---
id: get_hive_memory
type: pure_fn
description: Read byte from the organism shared neural memory block
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - HIVE_MEMORY_OFF
args:
  addr: i32
returns: u8
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getUint8(HIVE_MEMORY_OFF + (addr & 1023));
```

### AssemblyScript
```assemblyscript
return load<u8>(HIVE_MEMORY_OFF + (addr & 1023));
```
