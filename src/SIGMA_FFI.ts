// OMEGA-64 | SIGMA_FFI.ts | Era 75: The Singularity Bridge
// Interface to the Rust-based OMEGA Physics & VM Core via Deno FFI.

import { sharedBuffer } from "./_/mod.ts";

const libSuffix = Deno.build.os === "windows" ? "dll" : Deno.build.os === "darwin" ? "dylib" : "so";
const libPrefix = Deno.build.os === "windows" ? "" : "lib";

const searchPaths = [
  `./target/release/${libPrefix}omega_64.${libSuffix}`,
  `./target/debug/${libPrefix}omega_64.${libSuffix}`,
];

// Buffer to safely pass pointers to Rust
const latticeUint8 = new Uint8Array(sharedBuffer);

let lib: Deno.DynamicLibrary<{
  ffi_tick: { parameters: ["pointer", "u32"], result: "void" };
  ffi_init: { parameters: ["pointer"], result: "void" };
}> | null = null;

for (const path of searchPaths) {
  try {
    lib = Deno.dlopen(path, {
      ffi_tick: { parameters: ["pointer", "u32"], result: "void" },
      ffi_init: { parameters: ["pointer"], result: "void" },
      execute_atom: { parameters: ["usize"], result: "void" },
      build_spatial_hash: { parameters: [], result: "void" },
      tick_environment: { parameters: ["u32"], result: "void" },
    });
    console.log(`[SIGMA_FFI] Native core loaded from ${path}`);
    break;
  } catch (_e) {
    // try next
  }
}

if (!lib) {
  console.warn(`[SIGMA_FFI] Failed to load native core from search paths.`);
  console.warn(`[SIGMA_FFI] Ensure you have run 'deno task native:build'`);
}

/**
 * Executes a single tick of the entire OMEGA-64 matrix in the Rust core.
 * This completely replaces the TS-worker pulse logic when active.
 */
export function tickFFI(tick: number) {
  if (!lib) return;
  const ptr = Deno.UnsafePointer.of(latticeUint8);
  lib.symbols.ffi_tick(ptr, tick);
}

/**
 * Initializes the Rust core with the current SharedArrayBuffer.
 */
export function initFFI() {
  if (!lib) return;
  const ptr = Deno.UnsafePointer.of(latticeUint8);
  lib.symbols.ffi_init(ptr);
}

export const SIGMA_FFI = {
  tick: tickFFI,
  init: initFFI,
  executeAtom: (idx: number) => lib?.symbols.execute_atom(idx),
  buildSpatialHash: () => lib?.symbols.build_spatial_hash(),
  tickEnvironment: (tick: number) => lib?.symbols.tick_environment(tick),
  loaded: () => !!lib,
};
