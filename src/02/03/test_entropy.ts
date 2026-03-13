// OMEGA-64 | test_entropy.ts | Phase 23: Entropy Flux Verification
import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { PULSE } from "@02";

async function runTest() {
  console.log("🧪 OMEGA-64 | TEST_ENTROPY | Starting...");

  // 1. Initialize Workers
  await PULSE.initWorkers(1);

  // 2. Seed an atom with a self-looping script (infinite metabolic cost)
  const atomIdx = STATE_MATRIX.findFreeSlot();
  const id = 0xDEADBEEFn;

  // Script: JMP to 0 (Infinite NOP loop + metabolic cost)
  const script = new Uint8Array(64);
  script[0] = STATE_MATRIX.RISC.OP_JMP;
  script[1] = 0;

  const initialEnergy = 1000;
  STATE_MATRIX.seedAtom(
    atomIdx,
    id,
    70,
    40,
    initialEnergy,
    100,
    undefined,
    script,
  );

  console.log(
    `   [TEST] Atom ${atomIdx} seeded with ${initialEnergy} energy. Metabolic cost active.`,
  );

  let prevEnergy = initialEnergy;
  let pulseCount = 0;

  // 3. Run pulses and monitor energy
  for (let i = 0; i < 20; i++) {
    await PULSE.tick();
    const currentEnergy = STATE_MATRIX.getEnergy(atomIdx);

    console.log(
      `   Pulse ${i + 1}: Energy = ${currentEnergy.toFixed(2)} (Delta: ${
        (currentEnergy - prevEnergy).toFixed(2)
      })`,
    );

    if (currentEnergy >= prevEnergy && pulseCount > 0) {
      console.error("❌ TEST FAILED: Energy did not decrease!");
      Deno.exit(1);
    }

    prevEnergy = currentEnergy;
    pulseCount++;
  }

  console.log(
    "✅ TEST PASSED: Energy monotonically decreased due to metabolic cost.",
  );
  Deno.exit(0);
}

runTest();
