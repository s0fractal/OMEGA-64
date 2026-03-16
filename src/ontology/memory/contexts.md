---
id: contexts
type: module
description: Implementation of contexts
tags:
  - 00_memory
deps:
  - sharedBuffer
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - MAX_ATOMS
  - ATOM_CONTEXT_SIZE
  - CONTEXT_OFFSET
min_level: 0
---


```typescript




export const contexts = new Int32Array(sharedBuffer, CONTEXT_OFFSET, MAX_ATOMS * ATOM_CONTEXT_SIZE);
```
