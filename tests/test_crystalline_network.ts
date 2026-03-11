import { STATE_MATRIX, STRUCTURE } from "../00_substrate/mod.ts";
import { PULSE } from "../02_metabolism/mod.ts";

async function testCrystallineNetwork() {
  console.log("💎 [TEST] Starting Crystalline Neural Network Verification...");

  // 1. Initialize
  await PULSE.initWorkers();

  // 2. Setup a Wire Path
  const startX = 5, startY = 5;
  const endX = 10;

  // Set SOURCE at (5, 5)
  let idx = startY * 140 + startX;
  STATE_MATRIX.setGridType(idx, STRUCTURE.SOURCE);
  STATE_MATRIX.setGridCharge(idx, 255);

  // Set WIREs from (6, 5) to (10, 5)
  for (let x = 6; x <= endX; x++) {
    idx = startY * 140 + x;
    STATE_MATRIX.setGridType(idx, STRUCTURE.WIRE);
    STATE_MATRIX.setGridCharge(idx, 0);
  }

  console.log("   [TEST] Lattice: SOURCE at (5,5), WIREs to (10,5).");

  // 3. Let it propagate for 10 ticks (enough for 5 cells)
  for (let t = 0; t < 10; t++) {
    await PULSE.tick();
    const lastIdx = startY * 140 + endX;
    const lastCharge = STATE_MATRIX.getGridCharge(lastIdx);
    console.log(`   [TICK ${t}] Charge at (10,5): ${lastCharge}`);
  }

  const finalCharge = STATE_MATRIX.getGridCharge(startY * 140 + endX);
  if (finalCharge > 200) {
    console.log("✅ [TEST] Signal propagated successfully through the wire!");
  } else {
    console.error(
      `❌ [TEST] Signal failed to reach destination. Final Charge: ${finalCharge}`,
    );
    Deno.exit(1);
  }

  // 4. Test OP_PLUG with an Atom
  console.log("   [TEST] Testing OP_PLUG (Read Charge)...");
  const testIdx = STATE_MATRIX.findFreeSlot();
  const genome = new Uint8Array(8);

  // RISC Code:
  // byte 0: OP_PLUG (0xA4)
  // byte 1: Mode 0 (Read)
  // byte 2: Reg 1 (Dest)
  const riscCode = new Uint8Array(64);
  riscCode[0] = 0xA4;
  riscCode[1] = 0; // Mode: Read
  riscCode[2] = 1; // reg: 1

  // We use ID 1n to ensure we satisfy the trace_atom condition in PULSE_WORKER (currentId <= 10n)
  STATE_MATRIX.seedAtom(
    testIdx,
    1n,
    (endX * 10) + 5,
    (startY * 10) + 5,
    1000,
    0,
    genome,
    riscCode,
  );

  // Wait for propagation to be absolutely sure
  await PULSE.tick();
  await PULSE.tick();

  // Check atom register/context through canonical matrix accessors
  const reg1Value = STATE_MATRIX.getReg(testIdx, 1);
  const pcValue = STATE_MATRIX.getPC(testIdx);
  const energyValue = STATE_MATRIX.getEnergy(testIdx);

  console.log(
    `   [TEST] Atom status: PC=${pcValue}, Energy=${energyValue}, Reg1=${reg1Value}`,
  );

  // Check instructions at testIdx to be sure
  const instrCheck = STATE_MATRIX.getInstructions(testIdx).subarray(0, 8);
  console.log(`   [TEST] Bytecode at index 0: [${instrCheck.join(", ")}]`);

  if (reg1Value > 200) {
    console.log(
      "✅ [TEST] OP_PLUG successfully read lattice charge into atom register.",
    );
  } else {
    console.error(`❌ [TEST] OP_PLUG failed to read charge.`);
    Deno.exit(1);
  }

  console.log("🏁 [TEST] Crystalline Neural Network VERIFIED.");
  Deno.exit(0);
}

testCrystallineNetwork();
