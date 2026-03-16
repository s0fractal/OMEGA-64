---
id: get_glyph_arity
type: pure_fn
deps:
  - GLYPH_ARITY_LUT
  - TYPES
tags:
  - host
min_level: 6
args:
  id: u8
returns: u8
vars:
  - GLYPH_ARITY_LUT
extra_symbols:
  - get_glyph_arity
---
### Rust

```rust
GLYPH_ARITY_LUT[(id & 63) as usize]
```


```typescript




export function get_glyph_arity(id: number): number {
  return GLYPH_ARITY_LUT[id & 63];
}
```
