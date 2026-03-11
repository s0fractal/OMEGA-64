// OMEGA-64 | test_oracle_cascade.ts | Sovereign Oracle Verification
import { STATE_MATRIX } from "../00_substrate/mod.ts";
import { PULSE } from "../02_metabolism/mod.ts";
import { MATRIX_ENGINE } from "../01_physics/mod.ts";
import { ID_TO_IDX, IDX_TO_ID } from "../02_metabolism/mod.ts";

async function runTest() {
  console.log("👁️ Starting Phase 11: Sovereign Oracle Verification...");

  await PULSE.initWorkers();
  STATE_MATRIX.clear();

  const idxRegent = 4; // Our candidate Regent
  const regentId = "0xREGENT000000000";

  // --- SETUP: Candidate Regent ---
  STATE_MATRIX.setId(idxRegent, 0x1234567890n);
  STATE_MATRIX.setX(idxRegent, 500);
  STATE_MATRIX.setY(idxRegent, 500);
  STATE_MATRIX.setEnergy(idxRegent, 500);
  STATE_MATRIX.setResonance(idxRegent, 1000); // High resonance for election
  STATE_MATRIX.setLogic(idxRegent, new Uint8Array(8).fill(0xAA)); // Old genome

  // Manually register for Sovereignty Engine
  ID_TO_IDX.set(regentId, idxRegent);
  IDX_TO_ID.set(idxRegent, regentId);

  // --- SETUP: High Resonance Matrix (Trigger) ---
  console.log("💎 Awakening the Matrix...");
  for (let x = 450; x <= 550; x += 10) {
    for (let y = 450; y <= 550; y += 10) {
      MATRIX_ENGINE.setStructure(x, y, 1);
      MATRIX_ENGINE.inject(x, y, 100); // 121 cells * 100 = 12,100 total resonance
    }
  }

  console.log(
    `📊 Current Matrix Resonance: ${STATE_MATRIX.getMatrixResonance()}`,
  );

  // --- STEP 1: Pulse Tick ---
  console.log("\n🌀 TICK 1: Systemic Pulse (Triggering Oracle)...");

  // We expect:
  // 1. Matrix tick runs (resonance stays high)
  // 2. interpretResonance sees > 5000
  // 3. electRegent picks idx 4
  // 4. consultOracle starts (async)

  await PULSE.tick();

  console.log("⏳ Waiting for Async Oracle Consultation...");
  // The oracle uses the fallback since LLM is offline, usually takes very little time
  let attempts = 0;
  while (attempts < 10) {
    const currentLogic = STATE_MATRIX.getLogic(idxRegent);
    if (currentLogic[0] !== 0xAA) {
      console.log("✅ Oracle Guidance Received! Regent Genome Updated.");
      const hex = Array.from(currentLogic).map((b) =>
        b.toString(16).padStart(2, "0")
      ).join("");
      console.log(`⚡ New Genome: [${hex.toUpperCase()}]`);
      break;
    }
    await new Promise((r) => setTimeout(r, 1000));
    attempts++;
  }

  if (attempts >= 10) {
    console.log("❌ Oracle Guidance Timeout or Fail");
  }

  Deno.exit(0);
}

runTest();
