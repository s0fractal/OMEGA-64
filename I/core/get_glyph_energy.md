---
id: get_glyph_energy
type: pure_fn
deps:
  - GLYPH_ENERGY_LUT
  - TYPES
tags:
  - host
min_level: 6
args:
  id: u8
returns: u8
vars:
  - GLYPH_ENERGY_LUT
extra_symbols:
  - get_glyph_energy
---
### Rust

```rust
GLYPH_ENERGY_LUT[(id & 63) as usize]
```


```typescript




export function get_glyph_energy(id: number): number {
  return GLYPH_ENERGY_LUT[id & 63];
}
```
