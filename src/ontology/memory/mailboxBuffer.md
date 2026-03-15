---
id: mailboxBuffer
type: module
description: "Implementation of mailboxBuffer"
tags:
  - 00_memory
deps: [sharedBuffer, SYSTEM_CONSTANTS]
vars: [MAX_ATOMS, MAILBOX_OFFSET]
min_level: 0
---

### TypeScript
```typescript
export const mailboxBuffer = new Int32Array(sharedBuffer, MAILBOX_OFFSET, MAX_ATOMS * 2).buffer;
```
