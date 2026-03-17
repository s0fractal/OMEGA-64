---
id: hiveBalance
type: module
description: Implementation of hiveBalance
tags:
  - 00_memory
deps:
  - sharedBuffer
  - TYPES
vars:
  - HIVE_BALANCE_OFFSET
min_level: 0
---


```typescript




export const hiveBalance = new Int32Array(sharedBuffer, HIVE_BALANCE_OFFSET, 1);
```
