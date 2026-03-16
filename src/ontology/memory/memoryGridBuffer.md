---
id: memoryGridBuffer
type: module
description: Implementation of memoryGridBuffer
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




export const memoryGridBuffer = new Uint8Array(sharedBuffer, MEMORY_GRID_OFFSET, GRID_CELLS * 8).buffer;
```
