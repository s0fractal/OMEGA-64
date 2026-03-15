---
id: glyphHeaders
type: module
description: "Implementation of glyphHeaders"
tags:
  - 00_memory
deps: [sharedBuffer]
vars: [GRID_CELLS, GLYPH_HEADER_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const glyphHeaders = new Int32Array(sharedBuffer, GLYPH_HEADER_OFFSET, GRID_CELLS);
```
