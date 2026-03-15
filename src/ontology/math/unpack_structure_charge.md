---
id: unpack_structure_charge
type: pure_fn
description: >-
  Unpacks the charge value (top 7 bits, excluding lock bit) from a structure
  intent or charge descriptor.
tags:
  - inline
  - host
min_level: 6
deps: []
args:
  intent: i32
returns: u32
tests:
  - - 922746881
    - 55
  - - -2147483645
    - 0
extra_symbols:
  - unpack_structure_charge
---

### Rust
```rust
((intent as u32) & 0x7F000000) >> 24
```

### TypeScript
```typescript
export function unpack_structure_charge(intent: number): number {
    return ((intent >>> 0) & 0x7F000000) >>> 24;
}
```

### AssemblyScript
```assemblyscript
return ((intent as u32) & 0x7F000000) >> 24;
```
