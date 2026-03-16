---
id: get_logic_byte
type: pure_fn
description: Read a specific byte from an atom's logic array
deps:
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - LOGIC_OFFSET
args:
  idx: i32
  slot: i32
returns: u8
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getUint8(LOGIC_OFFSET + (idx << 3) + slot);
```

### AssemblyScript
```assemblyscript
return load<u8>(LOGIC_OFFSET + (idx << 3) + slot);
```
