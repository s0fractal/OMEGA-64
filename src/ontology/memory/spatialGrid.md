---
id: spatialGrid
type: module
description: Implementation of spatialGrid
tags:
  - 00_memory
deps:
  - sharedBuffer
  - TYPES
vars:
  - GRID_CELLS
  - SPATIAL_GRID_OFFSET
min_level: 0
---

### TypeScript
```typescript




export const spatialGrid = new Int32Array(sharedBuffer, SPATIAL_GRID_OFFSET, GRID_CELLS * 32);
```
