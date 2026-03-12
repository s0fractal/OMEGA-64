import * as OFFSETS from "../../mod.ts";
import { assertWasmLayout } from "../../03_tests/wasm_layout_guard.ts";

if (OFFSETS.WASM_MEMORY_PAGES < OFFSETS.MIN_WASM_MEMORY_PAGES) {
  console.error(
    `[wasm:build] Refusing build: pages=${OFFSETS.WASM_MEMORY_PAGES} < required=${OFFSETS.MIN_WASM_MEMORY_PAGES}`,
  );
  Deno.exit(1);
}

await Deno.mkdir("00_substrate/08_artifacts", { recursive: true });
await assertWasmLayout();

const args = [
  "run",
  "-A",
  "npm:assemblyscript@0.28.9/asc",
  "00_substrate/assembly/index.ts",
  "-O",
  "-o",
  "00_substrate/08_artifacts/release.wasm",
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

const stat = await Deno.stat("00_substrate/08_artifacts/release.wasm");
console.log(
  `[wasm:build] 00_substrate/08_artifacts/release.wasm=${stat.size} bytes, pages=${OFFSETS.WASM_MEMORY_PAGES}, required>=${OFFSETS.MIN_WASM_MEMORY_PAGES}`,
);
