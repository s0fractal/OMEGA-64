---
id: pack_structure_intent
type: pure_fn
description: "Packs a structure intent from a target type, a target value, and an optional lock bit."
tags: [inline, host]
min_level: 6
deps: []
args:
  target_type: u32
  target_value: u32
  locked: bool
returns: i32
tests:
  - [1, 55, false, 922746881]
  - [3, 0, true, -2147483645]
---

### Rust
```rust
let mut intent: u32 = target_type | (target_value << 24);
if locked {
    intent |= 0x80000000;
}
intent as i32
```

### TypeScript
```typescript
export function pack_structure_intent(target_type: number, target_value: number, locked: boolean): number {
    let intent = target_type | (target_value << 24);
    if (locked) {
        intent |= 0x80000000;
    }
    return intent | 0;
}
```

### AssemblyScript
```assemblyscript
let intent: u32 = target_type | (target_value << 24);
if (locked) {
    intent |= 0x80000000;
}
return intent as i32;
```
