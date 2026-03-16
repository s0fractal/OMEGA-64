---
id: stiffnessBuffer
type: module
description: Implementation of stiffnessBuffer
tags:
  - 00_memory
deps:
  - sharedBuffer
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - MAX_ATOMS
  - STIFFNESS_OFFSET
min_level: 0
---


```typescript




export const stiffnessBuffer = new Float32Array(sharedBuffer, STIFFNESS_OFFSET, MAX_ATOMS * 4).buffer;
```
