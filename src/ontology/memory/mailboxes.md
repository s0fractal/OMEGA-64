---
id: mailboxes
type: module
description: Implementation of mailboxes
tags:
  - 00_memory
deps:
  - sharedBuffer
  - SYSTEM_CONSTANTS
  - TYPES
vars:
  - MAX_ATOMS
  - MAILBOX_OFFSET
min_level: 0
---


```typescript




export const mailboxes = new Int32Array(sharedBuffer, MAILBOX_OFFSET, MAX_ATOMS * 2);
```
