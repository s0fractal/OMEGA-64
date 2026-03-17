---
id: glyphHeaderBuffer
type: module
description: Implementation of glyphHeaderBuffer
tags:
  - 00_memory
deps:
  - sharedBuffer
  - TYPES
vars:
  - GRID_CELLS
  - GLYPH_HEADER_OFFSET
min_level: 0
---


```typescript




export const glyphHeaderBuffer = new Int32Array(sharedBuffer, GLYPH_HEADER_OFFSET, GRID_CELLS).buffer;
```
