import * as OFFSETS from "./OFFSETS.ts";
import { assertWasmLayout } from "./wasm_layout_guard.ts";

if (OFFSETS.WASM_MEMORY_PAGES < OFFSETS.MIN_WASM_MEMORY_PAGES) {
  console.error(
    `[wasm:build] Refusing build: pages=${OFFSETS.WASM_MEMORY_PAGES} < required=${OFFSETS.MIN_WASM_MEMORY_PAGES}`,
  );
  Deno.exit(1);
}

await Deno.mkdir("build", { recursive: true });
await assertWasmLayout();

const args = [
  "run",
  "-A",
  "npm:assemblyscript@0.28.9/asc",
  "assembly/index.ts",
  "-o",
  "build/release.wasm",
  "-O",
  "--noAssert",
  "--importMemory",
  "--sharedMemory",
  "--initialMemory",
  String(OFFSETS.WASM_MEMORY_PAGES),
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

const stat = await Deno.stat("build/release.wasm");
console.log(
  `[wasm:build] build/release.wasm=${stat.size} bytes, pages=${OFFSETS.WASM_MEMORY_PAGES}, required>=${OFFSETS.MIN_WASM_MEMORY_PAGES}`,
);
