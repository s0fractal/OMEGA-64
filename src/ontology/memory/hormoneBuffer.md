---
id: hormoneBuffer
type: module
description: Implementation of hormoneBuffer
tags:
  - 00_memory
deps:
  - sharedBuffer
  - TYPES
vars:
  - MAX_HORMONES
  - HORMONE_OFFSET
min_level: 0
---

### TypeScript
```typescript




export const hormoneBuffer = new Uint16Array(sharedBuffer, HORMONE_OFFSET, MAX_HORMONES).buffer;
```
