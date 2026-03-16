---
id: ledgerHeadView
type: module
description: Implementation of ledgerHeadView
tags:
  - 00_memory
deps:
  - sharedBuffer
  - TYPES
vars:
  - LEDGER_HEAD_OFFSET
min_level: 0
---


```typescript




export const ledgerHeadView = new Int32Array(sharedBuffer, LEDGER_HEAD_OFFSET, 1);
```
