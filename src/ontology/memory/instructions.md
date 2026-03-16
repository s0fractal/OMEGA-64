---
id: instructions
type: module
description: Implementation of instructions
tags:
  - 00_memory
deps:
  - sharedBuffer
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - MAX_ATOMS
  - ATOM_INSTRUCTION_SIZE
  - INSTRUCTIONS_OFFSET
min_level: 0
---

### TypeScript
```typescript




export const instructions = new Uint8Array(sharedBuffer, INSTRUCTIONS_OFFSET, MAX_ATOMS * ATOM_INSTRUCTION_SIZE);
```
