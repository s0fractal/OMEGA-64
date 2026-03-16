---
id: latticeClearView
type: module
description: Implementation of latticeClearView
tags:
  - 00_memory
deps:
  - sharedBuffer
  - TYPES
vars:
  - TICK_COUNTER_OFFSET
min_level: 0
---


```typescript




export const latticeClearView = new Uint8Array(sharedBuffer, TICK_COUNTER_OFFSET);
```
