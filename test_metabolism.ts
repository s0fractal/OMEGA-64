import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import { SPATIAL_HASH } from "./SPATIAL_HASH.ts";

async function testMetabolism() {
  console.log("🧪 Starting Vector 4: Metabolic Sovereignty Verification...");

  // 1. Initialize State
  const wasmCode = await Deno.readFile("./build/release.wasm");
  const trace_atom = (
    _idx: number,
    _op: number,
    _gx: number,
    _gy: number,
    _tIdx: number,
  ) => {};
  const wasmModule = await WebAssembly.instantiate(wasmCode, {
    index: {
      trace_atom,
    },
    env: {
      memory: STATE_MATRIX.wasmMemory,
      trace_atom,
      abort: () => console.log("WASM Abort"),
    },
  });
  const wasm = wasmModule.instance.exports as any;

  // Reset Hive Balance
  STATE_MATRIX.setHiveBalance(1000);
  console.log(`Initial Hive Balance: ${STATE_MATRIX.getHiveBalance()}`);

  // --- TEST 1: OP_SHARE (Energy Transfer) ---
  // Atom 1 (Producer) bonded to Atom 2
  STATE_MATRIX.setId(1, 1n);
  STATE_MATRIX.setRole(1, STATE_MATRIX.ROLE_PRODUCER);
  STATE_MATRIX.setEnergy(1, 1000);
  STATE_MATRIX.setX(1, 100);
  STATE_MATRIX.setY(1, 100);

  STATE_MATRIX.setId(2, 2n);
  STATE_MATRIX.setEnergy(2, 100);
  STATE_MATRIX.setX(2, 110);
  STATE_MATRIX.setY(2, 100);

  // Bond 1 -> 2 in slot 0
  STATE_MATRIX.setBondTarget(1, 0, 2);

  // Bytecode for Atom 1: OP_SHARE slot 0, 50%
  const prog1 = new Uint8Array(64);
  prog1[0] = 0x83; // OP_SHARE
  prog1[1] = 0; // slot 0
  prog1[2] = 50; // 50%
  STATE_MATRIX.setInstructions(1, prog1);
  STATE_MATRIX.setPC(1, 0);

  wasm.execute_atom(1);

  const energy1 = STATE_MATRIX.getEnergy(1);
  const energy2 = STATE_MATRIX.getEnergy(2);
  console.log(
    `Test 1 (SHARE): Atom 1 Energy: ${energy1}, Atom 2 Energy: ${energy2}`,
  );
  if (energy1 < 1000 && energy2 > 100) {
    console.log("✅ OP_SHARE Energy transfer successful.");
  } else {
    console.log("❌ OP_SHARE failed.");
  }

  // --- TEST 2: Banking (Deposit/Withdraw) ---
  // Atom 3: Deposit 200
  STATE_MATRIX.setId(3, 3n);
  STATE_MATRIX.setEnergy(3, 500);
  const prog3 = new Uint8Array(64);
  prog3[0] = 0xA6; // OP_COLLECTIVE
  prog3[1] = 3; // Mode 3: BANK_DEPOSIT
  prog3[2] = 200; // Amount
  STATE_MATRIX.setInstructions(3, prog3);
  STATE_MATRIX.setPC(3, 0);

  // Atom 4: Withdraw (into reg 0)
  STATE_MATRIX.setId(4, 4n);
  STATE_MATRIX.setEnergy(4, 0);
  const prog4 = new Uint8Array(64);
  prog4[0] = 0xA6; // OP_COLLECTIVE
  prog4[1] = 4; // Mode 4: BANK_WITHDRAW
  prog4[2] = 0; // Reg 0
  STATE_MATRIX.setInstructions(4, prog4);
  STATE_MATRIX.setPC(4, 0);

  wasm.execute_atom(3);
  wasm.execute_atom(4);

  const bal = STATE_MATRIX.getHiveBalance();
  const e3 = STATE_MATRIX.getEnergy(3);
  const e4 = STATE_MATRIX.getEnergy(4);
  const r0 = STATE_MATRIX.getReg(4, 0);

  console.log(
    `Test 2 (BANK): Balance: ${bal}, Atom 3 Energy: ${e3}, Atom 4 Energy: ${e4}, Reg 0: ${r0}`,
  );
  if (bal === 1100 && r0 === 100) {
    console.log("✅ Banking Operations successful.");
  } else {
    console.log("❌ Banking failed.");
  }

  // --- TEST 3: Trophic Flow (Physics) ---
  // Producer (5) at (200, 200) with surplus
  STATE_MATRIX.setId(5, 5n);
  STATE_MATRIX.setRole(5, STATE_MATRIX.ROLE_PRODUCER);
  STATE_MATRIX.setEnergy(5, 1000);
  STATE_MATRIX.setX(5, 200);
  STATE_MATRIX.setY(5, 200);

  // Neutral (6) at (205, 200)
  STATE_MATRIX.setId(6, 6n);
  STATE_MATRIX.setRole(6, STATE_MATRIX.ROLE_NEUTRAL);
  STATE_MATRIX.setEnergy(6, 10);
  STATE_MATRIX.setX(6, 205);
  STATE_MATRIX.setY(6, 200);

  SPATIAL_HASH.build([5, 6]);

  PHYSICS_ENGINE.applyTrophicFlow();

  const e5 = STATE_MATRIX.getEnergy(5);
  const e6 = STATE_MATRIX.getEnergy(6);
  console.log(
    `Test 3 (TROPHIC): Producer Energy: ${e5}, Neutral Energy: ${e6}`,
  );
  if (e5 < 1000 && e6 > 10) {
    console.log("✅ Trophic Flow (Producer -> Neutral) successful.");
  } else {
    console.log("❌ Trophic Flow failed.");
  }

  console.log("\n🌀 Vector 4 Verification Complete.");
}

testMetabolism();
