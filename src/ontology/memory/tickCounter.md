---
id: tickCounter
type: module
description: Implementation of tickCounter
tags:
  - 00_memory
deps:
  - sharedBuffer
  - TYPES
vars:
  - TICK_COUNTER_OFFSET
min_level: 0
---

### TypeScript
```typescript




export const tickCounter = new Int32Array(sharedBuffer, TICK_COUNTER_OFFSET, 1);
```
