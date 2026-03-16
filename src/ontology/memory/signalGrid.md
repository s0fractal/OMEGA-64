---
id: signalGrid
type: module
description: Implementation of signalGrid
tags:
  - 00_memory
deps:
  - sharedBuffer
  - TYPES
vars:
  - GRID_CELLS
  - SIGNAL_GRID_OFFSET
min_level: 0
---

### TypeScript
```typescript




export const signalGrid = new Int32Array(sharedBuffer, SIGNAL_GRID_OFFSET, GRID_CELLS);
```
