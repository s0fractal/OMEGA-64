---
id: contextByteView
type: module
description: Implementation of contextByteView
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

### TypeScript
```typescript




export const contextByteView = new Uint8Array(sharedBuffer, CONTEXT_OFFSET, MAX_ATOMS * (ATOM_CONTEXT_SIZE * 4));
```
