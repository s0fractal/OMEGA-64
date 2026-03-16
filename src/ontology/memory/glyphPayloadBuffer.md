---
id: glyphPayloadBuffer
type: module
description: Implementation of glyphPayloadBuffer
tags:
  - 00_memory
deps:
  - sharedBuffer
  - TYPES
vars:
  - GRID_CELLS
  - GLYPH_PAYLOAD_OFFSET
min_level: 0
---

### TypeScript
```typescript




export const glyphPayloadBuffer = new Uint8Array(sharedBuffer, GLYPH_PAYLOAD_OFFSET, GRID_CELLS * 8).buffer;
```
