// OMEGA-64 | test_matrix.ts | The Awakened Matrix Verification
import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { PULSE } from "@02";
import { MATRIX_ENGINE } from "@01";

async function runTest() {
  console.log("💎 Starting Phase 10: The Awakened Matrix Verification...");

  await PULSE.initWorkers();
  STATE_MATRIX.clear();

  // --- SETUP: A Crystalline "Wire" from (500,500) to (600,500) ---
  console.log("🕸️ Constructing Crystal Wire...");
  for (let x = 500; x <= 600; x += 10) {
    MATRIX_ENGINE.setStructure(x, 500, 1); // Basic Crystal
  }

  // --- STEP 1: Inject signal at start of wire ---
  console.log("\n🌀 TICK 1: Injecting resonance at (500,500)...");
  MATRIX_ENGINE.inject(500, 500, 1000);

  await PULSE.tick();

  console.log(`📊 Start (500,500) Res: ${MATRIX_ENGINE.read(500, 500)}`);
  console.log(`📊 Mid   (550,500) Res: ${MATRIX_ENGINE.read(550, 500)}`);

  // --- STEP 2: Wait for propagation ---
  console.log("\n🌀 TICK 2-15: Observing propagation...");
  for (let i = 0; i < 14; i++) {
    await PULSE.tick();
  }

  const startRes = MATRIX_ENGINE.read(500, 500);
  const midRes = MATRIX_ENGINE.read(550, 500);
  const endRes = MATRIX_ENGINE.read(600, 500);

  console.log(`📊 Start (500,500) Res: ${startRes}`);
  console.log(`📊 Mid   (550,500) Res: ${midRes}`);
  console.log(`📊 End   (600,500) Res: ${endRes}`);

  if (endRes > 0) {
    console.log("✅ Crystalline conduction SUCCESS");
  } else {
    console.log("❌ Crystalline conduction FAIL (Signal did not reach end)");
  }

  // --- STEP 3: Logic Gate Verification (AND heuristic) ---
  console.log("\n🌀 STEP 3: Logic Gate (AND threshold) Verification...");
  MATRIX_ENGINE.setStructure(610, 500, 10); // Dense Gate Crystal
  MATRIX_ENGINE.inject(600, 500, 200); // Threshold check
  await PULSE.tick();
  console.log(
    `📊 Gate (610,500) Res (Input 200): ${MATRIX_ENGINE.read(610, 500)}`,
  );

  MATRIX_ENGINE.inject(600, 500, 2000); // Strong Input
  await PULSE.tick();
  console.log(
    `📊 Gate (610,500) Res (Input 2000): ${MATRIX_ENGINE.read(610, 500)}`,
  );

  Deno.exit(0);
}

runTest();
