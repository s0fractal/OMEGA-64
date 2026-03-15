---
id: signalGridBuffer
type: module
description: "Implementation of signalGridBuffer"
tags:
  - 00_memory
deps: [sharedBuffer]
vars: [GRID_CELLS, SIGNAL_GRID_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const signalGridBuffer = new Int32Array(sharedBuffer, SIGNAL_GRID_OFFSET, GRID_CELLS).buffer;
```
