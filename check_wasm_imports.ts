const wasmBytes = await Deno.readFile("build/release.wasm");
const wasmModule = await WebAssembly.compile(wasmBytes);
console.log("Imports:");
const imports = WebAssembly.Module.imports(wasmModule);
for (const imp of imports) {
  console.log(`  - ${imp.module}.${imp.name} (${imp.kind})`);
}
