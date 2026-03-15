// OMEGA-64 | test_breath.ts | Phase 23: Entropy Flux (Breath) Verification
import { MX } from "@generated";
import { PULSE } from "@generated";

async function runTest() {
  console.log("🧪 OMEGA-64 | TEST_BREATH | Starting...");

  // 1. Initialize Workers
  await PULSE.initWorkers(1);

  // 2. Seed an atom with 0 energy
  const atomIdx = MX.findFreeSlot();
  const id = 0xBEEFBEEFn;

  MX.seedAtom(atomIdx, id, 70, 40, 0, 100);

  console.log(`   [TEST] Atom ${atomIdx} seeded with 0 energy.`);

  const energyBefore = MX.getEnergy(atomIdx);
  if (energyBefore !== 0) {
    console.error(
      `❌ TEST FAILED: Initial energy is ${energyBefore}, expected 0.`,
    );
    Deno.exit(1);
  }

  // 3. Inject Negentropy (External Breath)
  const injectionAmount = 500;
  const affectedCount = MX.injectEnergy(injectionAmount);

  console.log(
    `   [TEST] Injected ${injectionAmount} energy into ${affectedCount} atoms.`,
  );

  const energyAfter = MX.getEnergy(atomIdx);

  console.log(`   [TEST] Energy After Breath: ${energyAfter.toFixed(2)}`);

  // Tolerance check (SCALE=1000)
  if (Math.abs(energyAfter - injectionAmount) > 0.1) {
    console.error(
      `❌ TEST FAILED: Energy after injection is ${energyAfter}, expected ${injectionAmount}.`,
    );
    Deno.exit(1);
  }

  console.log(
    "✅ TEST PASSED: External energy injection correctly restores vitality.",
  );
  Deno.exit(0);
}

runTest();
