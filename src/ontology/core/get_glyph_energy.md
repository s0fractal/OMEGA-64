---
id: get_glyph_energy
type: pure_fn
deps: [GLYPH_ENERGY_LUT]
tags: ["host"]
min_level: 6
args:
  id: u8
returns: u8
---
### Rust
```rust
GLYPH_ENERGY_LUT[(id & 63) as usize]
```

### TypeScript
```typescript
import { GLYPH_ENERGY_LUT } from "../00/mod.ts";

export function get_glyph_energy(id: number): number {
  return GLYPH_ENERGY_LUT[id & 63];
}
```
