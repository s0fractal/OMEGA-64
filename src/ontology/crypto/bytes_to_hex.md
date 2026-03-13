---
id: bytes_to_hex
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
description: Converts a Uint8Array to a hex string.
---

```typescript
export const bytes_to_hex = (bytes: Uint8Array): string =>
  Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
```
