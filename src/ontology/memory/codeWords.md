---
id: codeWords
type: module
description: Implementation of codeWords
tags:
  - 00_memory
deps:
  - sharedBuffer
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - MAX_ATOMS
  - INSTRUCTIONS_OFFSET
min_level: 0
---


```typescript




export const codeWords = new Uint32Array(sharedBuffer, INSTRUCTIONS_OFFSET, MAX_ATOMS * 16);
```
