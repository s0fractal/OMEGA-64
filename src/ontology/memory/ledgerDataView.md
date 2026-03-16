---
id: ledgerDataView
type: module
description: Implementation of ledgerDataView
tags:
  - 00_memory
deps:
  - sharedBuffer
  - TYPES
vars:
  - MAX_LEDGER_EVENTS
  - LEDGER_DATA_OFFSET
min_level: 0
---

### TypeScript
```typescript




export const ledgerDataView = new Int32Array(sharedBuffer, LEDGER_DATA_OFFSET, MAX_LEDGER_EVENTS * 4);
```
