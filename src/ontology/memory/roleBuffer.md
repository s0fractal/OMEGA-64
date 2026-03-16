---
id: roleBuffer
type: module
description: Implementation of roleBuffer
tags:
  - 00_memory
deps:
  - sharedBuffer
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - MAX_ATOMS
  - ROLES_OFFSET
min_level: 0
---

### TypeScript
```typescript




export const roleBuffer = new Uint8Array(sharedBuffer, ROLES_OFFSET, MAX_ATOMS).buffer;
```
