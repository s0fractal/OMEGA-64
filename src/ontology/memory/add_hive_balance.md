---
id: add_hive_balance
type: pure_fn
description: "Atomically add integer to global hive energy pool"
deps: 
  - OMEGA_MEMORY_LAYOUT
vars:
  - HIVE_BALANCE_OFF
args:
  val: i32
returns: i32
---

### Rust
```rust
unimplemented!("Memory accessors are host/WASM specific");
```

### TypeScript
```typescript
return Atomics.add(hiveBalanceView, 0, val);
```

### AssemblyScript
```assemblyscript
return atomic.add<i32>(HIVE_BALANCE_OFF, val);
```
