---
id: hex_to_bytes
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
description: Converts a hex string to a Uint8Array, returning null if invalid.
---

```typescript
export const hex_to_bytes = (hex: string): Uint8Array | null => {
  if (!/^[0-9a-fA-F]*$/u.test(hex) || hex.length % 2 !== 0) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    const byte = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    if (!Number.isFinite(byte)) return null;
    out[i] = byte;
  }
  return out;
};
```
