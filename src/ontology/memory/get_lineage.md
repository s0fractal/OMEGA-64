---
id: get_lineage
type: pure_fn
description: "Read atom lineage (u64) from the layout"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - LINEAGE_OFFSET
args:
  idx: i32
returns: u64
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return dataView.getBigUint64(LINEAGE_OFFSET + (idx << 3), true);
```

### AssemblyScript
```assemblyscript
return load<u64>(LINEAGE_OFFSET + (idx << 3));
```
