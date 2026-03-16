// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/wasm_memory_guard.md
import { WASM_MEMORY_PAGES, MIN_WASM_MEMORY_PAGES, TYPES } from "@g05";

export const assert_wasm_memory_depth = (): void => {
  if (WASM_MEMORY_PAGES < MIN_WASM_MEMORY_PAGES) {
    console.error(
      `[wasm:memory] Refusing operation: configured pages=${WASM_MEMORY_PAGES} < layout required=${MIN_WASM_MEMORY_PAGES}`,
    );
    throw new Error("WASM_MEMORY_PAGES_INSUFFICIENT");
  }
};
