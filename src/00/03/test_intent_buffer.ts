import { INTENT_OFFSET, STATE_MATRIX, wasmMemory } from "/Users/s0fractal/OMEGA/src/_/mod.ts";

async function testIntentBuffer() {
  console.log("🧪 Testing Zero-Allocation WASM Intent Buffer");

  // 1. Initialize Atom 0 with high energy
  STATE_MATRIX.setId(0, 1n);
  STATE_MATRIX.setEnergy(0, 100000); // 100 * SCALE

  // 2. Load WASM
  const wasmCode = await Deno.readFile("src/00/release.wasm");
  const wasmModule = await WebAssembly.compile(wasmCode);
  const instance = await WebAssembly.instantiate(wasmModule, {
    index: { trace_atom: () => {} },
    env: { memory: wasmMemory, trace_atom: () => {} },
  });
  const execute_atom = instance.exports.execute_atom as (idx: number) => void;

  // 3. Ensure Intent Buffer is empty
  const intents = new Uint32Array(wasmMemory.buffer, INTENT_OFFSET, 100000);
  intents[0] = 0;

  // 4. Execute WASM
  execute_atom(0);

  // 5. Verify Intent was written directly to SharedMemory (Should be 0x08 for Mitosis)
  const rawIntent = intents[0];
  const opcode = rawIntent & 0xFF;

  console.log(`[ATOM 0] Energy after tick: ${STATE_MATRIX.getEnergy(0)}`);
  console.log(
    `[ATOM 0] Intent Buffer Hex: 0x${rawIntent.toString(16).padStart(8, "0")}`,
  );

  if (opcode === 0x08) {
    console.log(
      "✅ SUCCESS: WASM successfully wrote MITOSIS intent to shared memory without FFI allocations.",
    );
  } else {
    console.log("❌ FAILED: Intent not found or incorrect.");
  }
}

testIntentBuffer();
