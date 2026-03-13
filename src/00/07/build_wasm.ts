import * as OFFSETS from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { assertWasmLayout } from "@00/03/wasm_layout_guard.ts";
import { resolveFsVectorSync } from "@07/01/vector_decoder.ts";

if (OFFSETS.WASM_MEMORY_PAGES < OFFSETS.MIN_WASM_MEMORY_PAGES) {
  console.error(
    `[wasm:build] Refusing build: pages=${OFFSETS.WASM_MEMORY_PAGES} < required=${OFFSETS.MIN_WASM_MEMORY_PAGES}`,
  );
  Deno.exit(1);
}

const artifactsDir = resolveFsVectorSync("@00");
await Deno.mkdir(artifactsDir, { recursive: true });
await assertWasmLayout();

const wasmFile = `${artifactsDir}/release.wasm`;
const assemblyFile = `${resolveFsVectorSync("@00")}/01/assembly/index.ts`;

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
  String(OFFSETS.MIN_WASM_MEMORY_PAGES),
  "--maximumMemory",
  String(OFFSETS.WASM_MEMORY_PAGES),
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
  `[wasm:build] ${wasmFile}=${stat.size} bytes, pages=${OFFSETS.WASM_MEMORY_PAGES}, required>=${OFFSETS.MIN_WASM_MEMORY_PAGES}`,
);
