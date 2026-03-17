---
id: syncState
type: module
description: Implementation of syncState
tags:
  - 00_memory
deps:
  - sharedBuffer
  - TYPES
vars:
  - SYNC_STATE_OFFSET
min_level: 0
---


```typescript




export const syncState = new Int32Array(sharedBuffer, SYNC_STATE_OFFSET, 1);
```
