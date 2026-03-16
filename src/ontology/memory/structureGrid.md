---
id: structureGrid
type: module
description: Implementation of structureGrid
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




export const structureGrid = new Int32Array(sharedBuffer, STRUCTURE_GRID_OFFSET, GRID_CELLS);
```
