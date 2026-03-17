---
id: memory_views_base
type: module
description: Base memory views initialization
tags:
  - 00_memory
deps:
  - SYSTEM_CONSTANTS
  - OMEGA_MEMORY_LAYOUT
  - TYPES
vars:
  - MIN_WASM_MEMORY_PAGES
  - WASM_MEMORY_PAGES
  - WASM_MEMORY_BYTES
  - validateMemoryLayout
min_level: 0
extra_symbols:
  - wasmMemory
  - sharedBuffer
---


```typescript




if (WASM_MEMORY_PAGES < MIN_WASM_MEMORY_PAGES) {
  throw new Error(
    "[MX] WASM memory too small: pages=" + WASM_MEMORY_PAGES + 
    ", required=" + MIN_WASM_MEMORY_PAGES,
  );
}
const layoutValidation = validateMemoryLayout(
  WASM_MEMORY_BYTES,
);
if (!layoutValidation.ok) {
  throw new Error(
    "[MX] Invalid OFFSETS memory layout:\n" +
      layoutValidation.errors.map((entry: any) => "- " + entry).join("\n")
  );
}

// Base Buffers for UI/WASM compatibility
export const wasmMemory = new WebAssembly.Memory({
  initial: MIN_WASM_MEMORY_PAGES,
  maximum: WASM_MEMORY_PAGES,
  shared: true,
});
export const sharedBuffer = wasmMemory.buffer as SharedArrayBuffer;
```
