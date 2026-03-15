// OMEGA-64 | test_coherence_field.ts | Stage 11.1 Dedicated Verification
import { MAX_ATOMS, MX } from "@generated";
import { PULSE } from "@generated";

async function test_coherence_field() {
  console.log(
    "🧬 [TEST] Starting Dedicated Global Coherence Field Verification...",
  );
  let failed = false;

  // 1. Initialize System
  await PULSE.initWorkers();

  // 2. Verify Neural Coherence Aggregation
  console.log("   [TEST] Testing Global Coherence Aggregation...");

  // Constant signal genome: sets resonance, signals, jumps back to signal
  const signalGenome = new Uint8Array(64);
  signalGenome[0] = 0x81; // OP_SIGNAL
  signalGenome[1] = 0x01; // OP_SET R0,
  signalGenome[2] = 0;
  signalGenome[3] = 200; // 200
  signalGenome[4] = 0x03; // OP_PUT R0, PROP_RESONANCE
  signalGenome[5] = 0;
  signalGenome[6] = 1;
  signalGenome[7] = 0x05; // OP_JMP
  signalGenome[8] = 1; // target: 1 (to reset resonance)

  // Reset neural coherence view
  Atomics.store(MX.neuralCoherence, 0, 0);

  // Seed 100 atoms to ensure we cross some thresholds easily
  for (let i = 1; i <= 100; i++) {
    MX.seedAtom(
      i,
      BigInt(i),
      50,
      50,
      1000,
      300,
      undefined,
      signalGenome,
    );
  }

  // Run tick
  await PULSE.tick();

  const coherence = Atomics.load(MX.neuralCoherence, 0);
  console.log(
    `   [TEST] Global Coherence after 100 atoms signaled: ${coherence}`,
  );

  if (coherence >= 100) {
    console.log("   [PASS] Coherence aggregation verified.");
  } else {
    console.error(
      `   [FAIL] Coherence aggregation failed. Got ${coherence}, expected >= 100.`,
    );
    failed = true;
  }

  // 3. Verify Phase Synchronization (using high volume signaling)
  console.log(
    "   [TEST] Testing Phase Synchronization (Harmonic Alignment)...",
  );

  // Seed 600 atoms to cross the 500 threshold
  for (let i = 1; i <= 600; i++) {
    MX.seedAtom(
      i,
      BigInt(i),
      50,
      50,
      2000,
      300,
      undefined,
      signalGenome,
    );
  }

  const syncAtomIdx = 700;
  MX.seedAtom(
    syncAtomIdx,
    700n,
    60,
    60,
    1000,
    0,
    undefined,
    new Uint8Array(64),
  );
  MX.setPhase(syncAtomIdx, 10);

  // Run tick. 600 atoms will fire -> coherence > 500 -> sync logic runs for atom 700
  await PULSE.tick();

  const phaseAfter = MX.getPhase(syncAtomIdx);
  const globalCoherenceFinal = Atomics.load(MX.neuralCoherence, 0);
  console.log(`   [TEST] Final Coherence: ${globalCoherenceFinal}`);
  console.log(
    `   [TEST] Atom Phase after sync tick: ${phaseAfter} (Expected: >10)`,
  );

  if (phaseAfter > 10) {
    console.log("   [PASS] Phase synchronization verified.");
  } else {
    console.error(
      `   [FAIL] Phase synchronization failed. Phase remained at ${phaseAfter}. Coherence was ${globalCoherenceFinal}`,
    );
    failed = true;
  }

  console.log("🧬 [TEST] Coherence Field Verification Complete.");
  Deno.exit(failed ? 1 : 0);
}

test_coherence_field().catch((err) => {
  console.error("   [TEST CRASH]", err);
  Deno.exit(1);
});
