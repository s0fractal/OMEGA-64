---
id: syncState
type: module
description: "Implementation of syncState"
tags:
  - 00_memory
deps: [sharedBuffer]
vars: [SYNC_STATE_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const syncState = new Int32Array(sharedBuffer, SYNC_STATE_OFFSET, 1);
```
