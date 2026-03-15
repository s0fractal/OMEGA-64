---
id: get_glyph_kind
type: pure_fn
description: "O(1) resolve of glyph category using bitwise shifts"
deps: [GLYPH_TYPES]
tags: ["host"]
min_level: 6
args:
  id: u8
returns: u8
---

### Rust

```rust
if id <= 3 {
  return KIND_CORE;
}
if id <= 15 {
  return KIND_CONTROL;
}
return id >> 3;
```

### TypeScript

```typescript
import { KIND_CORE, KIND_CONTROL } from "../00/mod.ts";

export function get_glyph_kind(id: number): number {
  if (id <= 3) return KIND_CORE;
  if (id <= 15) return KIND_CONTROL;
  return id >> 3;
}
```
