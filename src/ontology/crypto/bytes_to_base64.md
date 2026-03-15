---
id: bytes_to_base64
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
description: Converts a Uint8Array to a base64 string.
extra_symbols:
  - bytes_to_base64
---

```typescript
export const bytes_to_base64 = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes));
```
