import { MIN_WASM_MEMORY_PAGES, WASM_MEMORY_PAGES } from "@generated";
import { assertWasmLayout } from "@00/03/wasm_layout_guard.ts";
import { resolveFsVectorSync } from "@07/01/vector_decoder.ts";

if (WASM_MEMORY_PAGES < MIN_WASM_MEMORY_PAGES) {
  console.error(
    `[wasm:build] Refusing build: pages=${WASM_MEMORY_PAGES} < required=${MIN_WASM_MEMORY_PAGES}`,
  );
  Deno.exit(1);
}

const artifactsDir = new URL("../../_as", import.meta.url).pathname;
await Deno.mkdir(artifactsDir, { recursive: true });
await assertWasmLayout();

const wasmFile = `${artifactsDir}/release.wasm`;
const assemblyFile = `${artifactsDir}/mod.ts`;

const args = [
  "run",
  "-A",
  "npm:assemblyscript@0.28.9/asc",
  assemblyFile,
  "-O",
  "-o",
  wasmFile,
  "--noAssert",
  "--importMemory",
  "--sharedMemory",
  "--initialMemory",
  String(MIN_WASM_MEMORY_PAGES),
  "--maximumMemory",
  String(WASM_MEMORY_PAGES),
  "--enable",
  "threads",
  "--runtime",
  "stub",
];

const build = new Deno.Command("deno", {
  args,
  stdout: "inherit",
  stderr: "inherit",
});

const { code } = await build.output();
if (code !== 0) Deno.exit(code);

const stat = await Deno.stat(wasmFile);
console.log(
  `[wasm:build] ${wasmFile}=${stat.size} bytes, pages=${WASM_MEMORY_PAGES}, required>=${MIN_WASM_MEMORY_PAGES}`,
);
