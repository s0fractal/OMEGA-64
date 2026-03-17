---
id: coherence
type: module
description: Implementation of coherence
tags:
  - 00_memory
deps:
  - sharedBuffer
  - TYPES
vars:
  - COHERENCE_OFFSET
min_level: 0
---


```typescript




export const coherence = new Int32Array(sharedBuffer, COHERENCE_OFFSET, 1);
```
