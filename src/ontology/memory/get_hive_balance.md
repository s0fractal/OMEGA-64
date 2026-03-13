---
id: get_hive_balance
type: pure_fn
description: "Read total hive energy balance"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - HIVE_BALANCE_OFF
args: {}
returns: i32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return Atomics.load(hiveBalanceView, 0);
```

### AssemblyScript
```assemblyscript
return atomic.load<i32>(HIVE_BALANCE_OFF);
```
