---
id: memoryGridBuffer
type: module
description: "Implementation of memoryGridBuffer"
tags:
  - 00_memory
deps: [sharedBuffer]
vars: [GRID_CELLS, MEMORY_GRID_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const memoryGridBuffer = new Uint8Array(sharedBuffer, MEMORY_GRID_OFFSET, GRID_CELLS * 8).buffer;
```
