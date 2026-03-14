---
id: sha256_hex
type: module
dataType: null
returns: void
level: 0
min_level: 6
tags:
  - host
args: {}
vars:
  - bytes_to_hex
deps:
  - bytes_to_hex
description: Async SHA-256 hashing to hex strings for both text and raw bytes.
---

```typescript
const crypto = globalThis.crypto;
const encoder = new TextEncoder();

export const sha256_hex = async (input: string): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return bytes_to_hex(new Uint8Array(digest));
};

export const sha256_hex_bytes = async (bytes: Uint8Array): Promise<string> => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    bytes as unknown as BufferSource,
  );
  return bytes_to_hex(new Uint8Array(digest));
};
```
