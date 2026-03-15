---
id: hiveBalanceBuffer
type: module
description: "Implementation of hiveBalanceBuffer"
tags:
  - 00_memory
deps: [sharedBuffer]
vars: [HIVE_BALANCE_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const hiveBalanceBuffer = new Int32Array(sharedBuffer, HIVE_BALANCE_OFFSET, 1).buffer;
```
