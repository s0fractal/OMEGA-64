---
id: get_glyph_legacy_opcode
type: pure_fn
deps: [GLYPH_LEGACY_OPCODE_LUT]
tags: ["host"]
min_level: 6
args:
  id: u8
returns: u8
---
### Rust

```rust
GLYPH_LEGACY_OPCODE_LUT[(id & 63) as usize]
```

### TypeScript

```typescript
import { GLYPH_LEGACY_OPCODE_LUT } from "../00/mod.ts";

export function get_glyph_legacy_opcode(id: number): number {
  return GLYPH_LEGACY_OPCODE_LUT[id & 63];
}
```
