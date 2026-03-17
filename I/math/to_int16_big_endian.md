---
id: to_int16_big_endian
type: module
description: >-
  Converts an Int16Array wrapper into correctly encoded Uint8Array bytes via Big
  Endian orientation.
tags:
  - host
min_level: 6
deps:
  - TYPES
returns: void
extra_symbols:
  - to_int16_big_endian
---


```typescript




export const to_int16_big_endian = (values: Int16Array): Uint8Array => {
  const out = new Uint8Array(values.length * 2);
  for (let i = 0; i < values.length; i++) {
    const v = values[i] < 0 ? values[i] + 0x1_0000 : values[i];
    out[i * 2] = (v >>> 8) & 0xFF;
    out[i * 2 + 1] = v & 0xFF;
  }
  return out;
};
```
