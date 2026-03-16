---
id: ys
type: module
description: Implementation of ys
tags:
  - 00_memory
deps:
  - sharedBuffer
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - MAX_ATOMS
  - YS_OFFSET
min_level: 0
---


```typescript




export const ys = new Int16Array(sharedBuffer, YS_OFFSET, MAX_ATOMS);
```
