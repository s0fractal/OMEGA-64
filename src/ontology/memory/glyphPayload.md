---
id: glyphPayload
type: module
description: "Implementation of glyphPayload"
tags:
  - 00_memory
deps: [sharedBuffer]
vars: [GRID_CELLS, GLYPH_PAYLOAD_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const glyphPayload = new Uint8Array(sharedBuffer, GLYPH_PAYLOAD_OFFSET, GRID_CELLS * 8);
```
