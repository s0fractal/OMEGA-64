// OMEGA-64 | test_vector10_planetary.ts | Vector 10 Verification
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";
import { SOVEREIGN_ORACLE } from "./SOVEREIGN_ORACLE.ts";
import {
  assertEquals,
  assertGreater,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

async function runTest() {
  console.log("🧬 Starting Vector 10 Verification...");

  // 0. BYPASS STARTUP SELF-TEST
  // The self-test clears the matrix if no atoms are present.
  STATE_MATRIX.seedAtom(99999, 1n, 0, 0, 0, 0);

  // 1. RECRYSTALLIZATION TEST (VOID -> WIRE)
  console.log("\n--- [1] Recrystallization Test ---");
  const tx = 70, ty = 40;
  const targetIdx = ty * 140 + tx;
  const sourceIdx = ty * 140 + (tx - 1);

  // Set source next to VOID
  STATE_MATRIX.setGridType(sourceIdx, 4); // STR_SOURCE
  STATE_MATRIX.setGridCharge(sourceIdx, 255);
  // Ensure target is VOID
  Atomics.store(STATE_MATRIX.structureGrid, targetIdx, 0);
  console.log(`Target ${targetIdx} initialized to STR_VOID.`);

  // Run a few ticks
  for (let i = 0; i < 10; i++) {
    await PULSE.tick();
    const rawVal = Atomics.load(STATE_MATRIX.structureGrid, targetIdx);
    const type = rawVal & 0xFF;
    const charge = (rawVal >> 16) & 0xFF;
    console.log(
      `   [DEBUG] Tick ${
        i + 1
      } | Target ${targetIdx} | Type: ${type} | Charge: ${charge}`,
    );
    if (type === 1) break; // Captured early
  }

  const resultType = STATE_MATRIX.getGridType(targetIdx);
  console.log(`Resulting Type at (${tx},${ty}): ${resultType}`);
  if (resultType === 1) {
    console.log("✅ Recrystallization Successful: VOID became WIRE.");
  } else {
    console.log("❌ Recrystallization Failed.");
  }

  // 2. COHERENCE FEEDBACK TEST (OP_SIGNAL -> Broadcaster)
  console.log("\n--- [2] Coherence Feedback Test ---");
  // Seed atoms that fire OP_SIGNAL (0x81)
  const signalScript = new Uint8Array([0x81, 0x00]); // OP_SIGNAL then NOP
  const signalGenome = new Uint8Array([0x81, 0, 0, 0, 0, 0, 0, 0]);

  for (let i = 0; i < 20; i++) {
    // i, id, x, y, energy, resonance, logicVal, script
    STATE_MATRIX.seedAtom(
      i,
      BigInt(i + 1),
      700 + i,
      400,
      1000,
      200,
      signalGenome,
      signalScript,
    );
  }

  // Run a few ticks to aggregate signals
  for (let i = 0; i < 3; i++) {
    await PULSE.tick();
  }

  const coherenceValue = SOVEREIGN_ORACLE.neuralCoherence;
  console.log(`Reported Neural Coherence: ${coherenceValue}`);
  // We need at least 1 signal to pass the test
  if (coherenceValue > 0) {
    console.log("✅ Coherence Feedback Loop Operational.");
  } else {
    console.log("❌ Coherence Feedback Loop Failed (reported 0).");
  }

  // 3. WHISPER CHANNEL TEST (High Coherence -> Memetic Seeding)
  console.log("\n--- [3] Whisper Channel Test ---");
  // Force high coherence via direct memory write for testing
  Atomics.store(STATE_MATRIX.coherence, 0, 1000);

  // High coherence + tick should trigger broadcastWhisper
  const initialMutationCount =
    (SOVEREIGN_ORACLE as any).pendingMutations?.length ?? 0;
  await PULSE.tick();

  const pendingMutations = (SOVEREIGN_ORACLE as any).pendingMutations || [];
  const whisper = pendingMutations.find((m: any) =>
    m.kind === "oracle_whisper_broadcast"
  );

  if (whisper) {
    console.log(
      `✅ Whisper Detected! Target GridIdx: ${whisper.gridIdx}, Charge: ${whisper.charge}`,
    );
  } else {
    console.log("❌ No Whisper detected even with high coherence.");
  }

  console.log("\n🛡️ Vector 10 Verification Complete.");
}

if (import.meta.main) {
  runTest().catch(console.error);
}
