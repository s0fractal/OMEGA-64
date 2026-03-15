---
id: hiveMemoryBuffer
type: module
description: "Implementation of hiveMemoryBuffer"
tags:
  - 00_memory
deps: [sharedBuffer]
vars: [HIVE_MEMORY_SIZE, HIVE_MEMORY_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const hiveMemoryBuffer = new Uint8Array(sharedBuffer, HIVE_MEMORY_OFFSET, HIVE_MEMORY_SIZE).buffer;
```
