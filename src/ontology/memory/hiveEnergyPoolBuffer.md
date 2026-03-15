---
id: hiveEnergyPoolBuffer
type: module
description: "Implementation of hiveEnergyPoolBuffer"
tags:
  - 00_memory
deps: [sharedBuffer]
vars: [HIVE_ENERGY_POOL_SIZE, HIVE_ENERGY_POOL_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const hiveEnergyPoolBuffer = new Int32Array(sharedBuffer, HIVE_ENERGY_POOL_OFFSET, HIVE_ENERGY_POOL_SIZE).buffer;
```
