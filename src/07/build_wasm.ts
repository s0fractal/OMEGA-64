import { MIN_WASM_MEMORY_PAGES, WASM_MEMORY_PAGES, assert_wasm_memory_depth } from "../_/mod.ts";

assert_wasm_memory_depth();

const envAsDir = Deno.env.get("GEN_DIR_AS") || "src/_as";
const envAsName = Deno.env.get("AS_WASM_NAME") || "release.wasm";

const artifactsDir = Deno.cwd() + "/" + envAsDir;
await Deno.mkdir(artifactsDir, { recursive: true });

const wasmFile = artifactsDir + "/" + envAsName;
const assemblyFile = artifactsDir + "/mod.ts";

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
