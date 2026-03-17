---
id: get_glyph_legacy_opcode
type: pure_fn
deps:
  - GLYPH_LEGACY_OPCODE_LUT
  - TYPES
tags:
  - host
min_level: 6
args:
  id: u8
returns: u8
vars:
  - GLYPH_LEGACY_OPCODE_LUT
extra_symbols:
  - get_glyph_legacy_opcode
---
### Rust

```rust
GLYPH_LEGACY_OPCODE_LUT[(id & 63) as usize]
```


```typescript




export function get_glyph_legacy_opcode(id: number): number {
  return GLYPH_LEGACY_OPCODE_LUT[id & 63];
}
```
