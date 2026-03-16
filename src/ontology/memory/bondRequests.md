---
id: bondRequests
type: module
description: Implementation of bondRequests
tags:
  - 00_memory
deps:
  - sharedBuffer
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - MAX_ATOMS
  - BOND_REQUESTS_OFFSET
min_level: 0
---


```typescript




export const bondRequests = new Int32Array(sharedBuffer, BOND_REQUESTS_OFFSET, MAX_ATOMS * 3);
```
