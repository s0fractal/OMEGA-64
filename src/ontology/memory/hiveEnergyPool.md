---
id: hiveEnergyPool
type: module
description: Implementation of hiveEnergyPool
tags:
  - 00_memory
deps:
  - sharedBuffer
  - TYPES
vars:
  - HIVE_ENERGY_POOL_SIZE
  - HIVE_ENERGY_POOL_OFFSET
min_level: 0
---

### TypeScript
```typescript




export const hiveEnergyPool = new Int32Array(sharedBuffer, HIVE_ENERGY_POOL_OFFSET, HIVE_ENERGY_POOL_SIZE);
```
