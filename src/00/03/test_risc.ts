// OMEGA-64 | test_risc.ts | VM Verification Suite
import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { OP_GET, PROP_ENERGY, OP_SET, OP_ADD, OP_PUT, OP_SUB, OP_JNZ } from "../../00/STATE_MATRIX.ts";

async function runTest() {
  console.log("🚀 Initializing RISC VM Test...");

  const wasmCode = await Deno.readFile("src/00/release.wasm");
  const trace_atom = (
    idx: number,
    op: number,
    gx: number,
    gy: number,
    pc: number,
  ) => {
    console.log(`[TRACE] Atom ${idx}: Op 0x${op.toString(16)} @ PC ${pc}`);
  };
  const wasmModule = await WebAssembly.instantiate(wasmCode, {
    index: {
      trace_atom,
    },
    env: {
      trace_atom,
      memory: STATE_MATRIX.wasmMemory,
      abort: () => console.error("WASM Aborted"),
    },
  });

  const exports = wasmModule.instance.exports as any;
  const execute_atom = exports.execute_atom;

  // --- TEST 1: SET & GET Property ---
  console.log("\n--- TEST 1: SET & GET Property ---");
  const atomIdx = 0;
  STATE_MATRIX.setId(atomIdx, 1n);
  STATE_MATRIX.set_energy(atomIdx, 100);

  // Script:
  // R0 = Energy (GET R0, Energy) -> R0 = 100,000
  // R1 = 50 (SET R1, 50)
  // R0 = R0 + R1 -> R0 = 100,050
  // Energy = R0 (PUT Energy, R0) -> Energy = 100,050 / 1000 = 100.05

  const script = new Uint8Array(64);
  let p = 0;
  script[p++] = OP_GET;
  script[p++] = 0;
  script[p++] = PROP_ENERGY;
  script[p++] = OP_SET;
  script[p++] = 1;
  script[p++] = 50;
  script[p++] = OP_ADD;
  script[p++] = 0;
  script[p++] = 1;
  script[p++] = OP_PUT;
  script[p++] = 0;
  script[p++] = PROP_ENERGY;

  STATE_MATRIX.setInstructions(atomIdx, script);
  STATE_MATRIX.set_p_c(atomIdx, 0);

  execute_atom(atomIdx);

  const finalEnergy = STATE_MATRIX.get_energy(atomIdx);
  console.log(`Final Energy: ${finalEnergy} (Expected: 100.05)`);
  if (Math.abs(finalEnergy - 100.05) < 0.001) {
    console.log("✅ TEST 1 PASSED");
  } else {
    console.error("❌ TEST 1 FAILED");
  }

  // --- TEST 2: Control Flow (JNZ) ---
  console.log("\n--- TEST 2: JNZ Loop ---");
  // R0 = 3
  // Loop (offset 3):
  //   R1 = 1
  //   R0 = R0 - R1
  //   JNZ R0, Loop (offset 3)

  const script2 = new Uint8Array(64);
  p = 0;
  script2[p++] = OP_SET;
  script2[p++] = 0;
  script2[p++] = 3; // offset 0
  // Loop start at offset 3
  script2[p++] = OP_SET;
  script2[p++] = 1;
  script2[p++] = 1; // offset 3
  script2[p++] = OP_SUB;
  script2[p++] = 0;
  script2[p++] = 1; // offset 6
  script2[p++] = OP_JNZ;
  script2[p++] = 0;
  script2[p++] = 3; // offset 9

  STATE_MATRIX.setInstructions(atomIdx, script2);
  STATE_MATRIX.set_p_c(atomIdx, 0);
  STATE_MATRIX.set_reg(atomIdx, 0, 0);
  STATE_MATRIX.set_reg(atomIdx, 1, 0);

  execute_atom(atomIdx);

  const r0 = STATE_MATRIX.get_reg(atomIdx, 0);
  console.log(`R0 after loop: ${r0} (Expected: 0)`);
  if (r0 === 0) {
    console.log("✅ TEST 2 PASSED");
  } else {
    console.error("❌ TEST 2 FAILED");
  }

  Deno.exit(0);
}

runTest();
