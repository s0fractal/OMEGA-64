---
id: clamp_resource
type: pure_fn
description: Clamps a resource value between 0 and RESOURCE_MAX
deps:
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - RESOURCE_MAX
args:
  value: i64
returns: i32
---

### Rust
```rust
if value < 0 {
    0
} else if value > (RESOURCE_MAX as i64) {
    RESOURCE_MAX as i32
} else {
    value as i32
}
```


```typescript




if (value < 0n) return 0;
if (value > BigInt(RESOURCE_MAX)) return RESOURCE_MAX;
return Number(value);
```


```assemblyscript
if (value < 0) return 0;
if (value > (RESOURCE_MAX as i64)) return RESOURCE_MAX;
return value as i32;
```
