// OMEGA-64 | test_neuro.ts | Sovereign Neurogenesis Verification
import { STATE_MATRIX } from "@generated";
import { PULSE } from "@02";
import { SPATIAL_HASH } from "@06";

const ISA_BIND = 0x40;
const ISA_SHARE = 0x41;
const ISA_SIGNAL = 0x42;

async function runTest() {
  console.log("🧠 Starting Phase 9: Sovereign Neurogenesis Verification...");

  await PULSE.initWorkers();
  STATE_MATRIX.clear();

  const idxA = 1;
  const idxB = 2;
  const idxC = 3;

  // --- SETUP: Chain of 3 atoms ---
  const atoms = [idxA, idxB, idxC];
  for (let i = 0; i < atoms.length; i++) {
    const idx = atoms[i];
    STATE_MATRIX.setId(idx, BigInt(idx));
    STATE_MATRIX.setX(idx, 500 + i * 5); // Close together but distinct
    STATE_MATRIX.setY(idx, 500);
    STATE_MATRIX.setEnergy(idx, 20);
    STATE_MATRIX.setLogic(idx, new Uint8Array(8).fill(0));
  }

  console.log("🕸️ Priming Bonds (A-B, B-C)...");
  // Manually establish bonds for the test
  STATE_MATRIX.setBondTarget(idxA, 0, idxB);
  STATE_MATRIX.setBondStiffness(idxA, 0, 1.0); // Strong synapse
  STATE_MATRIX.setBondTarget(idxB, 0, idxA);
  STATE_MATRIX.setBondStiffness(idxB, 0, 1.0);

  STATE_MATRIX.setBondTarget(idxB, 1, idxC);
  STATE_MATRIX.setBondStiffness(idxB, 1, 1.0);
  STATE_MATRIX.setBondTarget(idxC, 0, idxB);
  STATE_MATRIX.setBondStiffness(idxC, 0, 1.0);

  SPATIAL_HASH.build(atoms);

  // --- STEP 1: Atom A fires signal ---
  console.log("\n🌀 TICK 1: Atom A (1) triggers ISA_SIGNAL...");
  const logicA = new Uint8Array(8);
  logicA[0] = ISA_SIGNAL;
  STATE_MATRIX.setLogic(idxA, logicA);

  await PULSE.tick();

  console.log(
    `📊 A Phase: ${STATE_MATRIX.getPhase(idxA)} | B Resonance: ${
      STATE_MATRIX.getResonance(idxB)
    }`,
  );

  if (STATE_MATRIX.getResonance(idxB) > 0) {
    console.log("✅ Signal received by B");
  } else {
    console.log("❌ Signal propagation FAIL");
  }

  // --- STEP 2: Atom B should hit threshold and fire ---
  // B logic is still 0, but temporal summation in kernel should trigger fire if resonance > 500
  // Wait, signal strength is 100 * stiffness = 100. Threshold is 500.
  // Let's fire A multiple times or increase signal strength.

  console.log("\n🌀 TICK 2-5: Accumulating resonance in B...");
  for (let i = 0; i < 4; i++) {
    // A is in refractory, we need to wait or reset it for the test
    STATE_MATRIX.setPhase(idxA, 0);
    await PULSE.tick();
  }

  console.log(`📊 B Resonance: ${STATE_MATRIX.getResonance(idxB)}`);

  console.log(
    "\n🌀 TICK 6: B threshold reached -> Surge & Propagation to C...",
  );
  await PULSE.tick();

  console.log(
    `📊 B Energy: ${STATE_MATRIX.getEnergy(idxB).toFixed(1)} | C Resonance: ${
      STATE_MATRIX.getResonance(idxC)
    }`,
  );

  if (STATE_MATRIX.getEnergy(idxB) > 20) {
    console.log("✅ B Metabolic Surge SUCCESS");
  }
  if (STATE_MATRIX.getResonance(idxC) > 0) {
    console.log("✅ Signal propagated to C SUCCESS");
  }

  Deno.exit(0);
}

runTest();
