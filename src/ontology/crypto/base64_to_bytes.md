---
id: base64_to_bytes
type: module
dataType: null
returns: void
level: 0
min_level: 6
tags:
  - host
args: {}
vars: []
deps: []
description: Converts a base64 string to a Uint8Array.
extra_symbols:
  - base64_to_bytes
---

```typescript
export const base64_to_bytes = (b64: string): Uint8Array =>
  Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
```
