---
id: read_jsonl
type: module
description: Lightweight JSONL reader generator
tags: []
min_level: 0
extra_symbols:
  - read_jsonl
deps:
  - TYPES
---


```typescript




export const read_jsonl = async function* (path: string): AsyncGenerator<any> {
  try {
    const raw = await Deno.readTextFile(path);
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t) continue;
      try {
        yield JSON.parse(t);
      } catch {
        // skip malformed rows for compatibility
      }
    }
  } catch {
    // no file => empty stream
  }
};
```

```assemblyscript
export function read_jsonl(): void {}
```
