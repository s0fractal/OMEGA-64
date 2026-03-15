---
id: get_glyph_arity
type: pure_fn
deps: [GLYPH_ARITY_LUT]
tags: ["host"]
min_level: 6
args:
  id: u8
returns: u8
---
### Rust

```rust
GLYPH_ARITY_LUT[(id & 63) as usize]
```

### TypeScript

```typescript
import { GLYPH_ARITY_LUT } from "../00/mod.ts";

export function get_glyph_arity(id: number): number {
  return GLYPH_ARITY_LUT[id & 63];
}
```
