---
id: hiveMemory
type: module
description: Implementation of hiveMemory
tags:
  - 00_memory
deps:
  - sharedBuffer
  - TYPES
vars:
  - HIVE_MEMORY_SIZE
  - HIVE_MEMORY_OFFSET
min_level: 0
---


```typescript




export const hiveMemory = new Uint8Array(sharedBuffer, HIVE_MEMORY_OFFSET, HIVE_MEMORY_SIZE);
```
