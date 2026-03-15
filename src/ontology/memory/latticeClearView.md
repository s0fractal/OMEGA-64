---
id: latticeClearView
type: module
description: "Implementation of latticeClearView"
tags:
  - 00_memory
deps: [sharedBuffer]
vars: [TICK_COUNTER_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const latticeClearView = new Uint8Array(sharedBuffer, TICK_COUNTER_OFFSET);
```
