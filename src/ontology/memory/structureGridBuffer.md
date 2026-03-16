---
id: structureGridBuffer
type: module
description: Implementation of structureGridBuffer
tags:
  - 00_memory
deps:
  - sharedBuffer
  - TYPES
vars:
  - GRID_CELLS
  - STRUCTURE_GRID_OFFSET
min_level: 0
---

### TypeScript
```typescript




export const structureGridBuffer = new Int32Array(sharedBuffer, STRUCTURE_GRID_OFFSET, GRID_CELLS).buffer;
```
