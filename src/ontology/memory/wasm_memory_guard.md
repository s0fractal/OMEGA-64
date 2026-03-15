---
id: assert_wasm_memory_depth
type: pure_fn
description: "Host validator ensuring pre-allocated WASM limits are not exceeded by minimum requirements."
tags: ["memory", "host"]
min_level: 6
deps:
  - SYSTEM_CONSTANTS
  - OMEGA_MEMORY_LAYOUT
vars:
  - WASM_MEMORY_PAGES
  - MIN_WASM_MEMORY_PAGES
args: {}
returns: void
---

### TypeScript
```typescript
export const assert_wasm_memory_depth = (): void => {
  if (WASM_MEMORY_PAGES < MIN_WASM_MEMORY_PAGES) {
    console.error(
      `[wasm:memory] Refusing operation: configured pages=${WASM_MEMORY_PAGES} < layout required=${MIN_WASM_MEMORY_PAGES}`,
    );
    throw new Error("WASM_MEMORY_PAGES_INSUFFICIENT");
  }
};
```
