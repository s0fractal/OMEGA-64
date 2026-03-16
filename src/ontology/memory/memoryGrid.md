---
id: memoryGrid
type: module
description: Implementation of memoryGrid
tags:
  - 00_memory
deps:
  - sharedBuffer
  - TYPES
vars:
  - GRID_CELLS
  - MEMORY_GRID_OFFSET
min_level: 0
---


```typescript




export const memoryGrid = new Uint8Array(sharedBuffer, MEMORY_GRID_OFFSET, GRID_CELLS * 8);
```
