import { MIN_WASM_MEMORY_PAGES, WASM_MEMORY_PAGES, assert_wasm_memory_depth } from "../_/mod.ts";

assert_wasm_memory_depth();

const artifactsDir = Deno.cwd() + "/src/_rust";
await Deno.mkdir(artifactsDir, { recursive: true });

const wasmFile = artifactsDir + "/release.wasm";

console.log("[rust:build] Compiling sigma_core to WASM...");

const args = [
  "build",
  "--target",
  "wasm32-unknown-unknown",
  "--release",
];

const build = new Deno.Command("cargo", {
  args,
  stdout: "inherit",
  stderr: "inherit",
});

const { code } = await build.output();
if (code !== 0) {
  console.error(`[rust:build] Cargo build failed with code ${code}`);
  Deno.exit(code);
}

// Locate the built WASM file. Cargo puts it in target/wasm32-unknown-unknown/release/*.wasm
const targetWasm = Deno.cwd() + "/target/wasm32-unknown-unknown/release/omega_64.wasm";

try {
  await Deno.copyFile(targetWasm, wasmFile);
} catch (err) {
  console.error(`[rust:build] Failed to copy WASM from ${targetWasm} to ${wasmFile}: ${(err as Error).message}`);
  Deno.exit(1);
}

const stat = await Deno.stat(wasmFile);
console.log(
  `[rust:build] SUCCESS: ${wasmFile}=${stat.size} bytes`,
);
