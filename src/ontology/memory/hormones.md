---
id: hormones
type: module
description: Implementation of hormones
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




export const hormones = new Uint16Array(sharedBuffer, HORMONE_OFFSET, MAX_HORMONES);
```
