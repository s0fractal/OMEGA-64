---
id: logic
type: module
description: Implementation of logic
tags:
  - 00_memory
deps:
  - sharedBuffer
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - MAX_ATOMS
  - ATOM_GENOME_SIZE
  - LOGIC_OFFSET
min_level: 0
---


```typescript




export const logic = new Uint8Array(sharedBuffer, LOGIC_OFFSET, MAX_ATOMS * ATOM_GENOME_SIZE);
```
