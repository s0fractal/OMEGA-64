---
id: damping
type: module
description: Implementation of damping
tags:
  - 00_memory
deps:
  - sharedBuffer
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - MAX_ATOMS
  - DAMPING_OFFSET
min_level: 0
---


```typescript




export const damping = new Uint8Array(sharedBuffer, DAMPING_OFFSET, MAX_ATOMS);
```
