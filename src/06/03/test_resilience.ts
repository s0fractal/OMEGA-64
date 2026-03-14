// OMEGA-64 | test_resilience.ts | Era 68: Resilience Verification
import { STATE_MATRIX } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { PULSE } from "@02";
import { SNAPSHOT_ENGINE } from "@06";
import { IDS_OFFSET } from "/Users/s0fractal/OMEGA/src/_/mod.ts";
import { RIBOSOME } from "@02";

async function runTest() {
  console.log("🏎️ Starting Phase 12: Systemic Resilience Verification...");

  // 1. SNAPSHOT INTEGRITY TEST
  console.log("\n🛡️ Testing Snapshot Integrity...");
  STATE_MATRIX.clear();
  await PULSE.initWorkers();
  // Set some dummy data
  STATE_MATRIX.setEnergy(1, 999);
  const snap = await SNAPSHOT_ENGINE.exportSnapshot();
  if (!snap.success) throw new Error("Export failed");

  // Manually Corrupt the binary file
  const matrixPath = `.omega/snapshots/matrix_${snap.timestamp}.bin`;
  const data = await Deno.readFile(matrixPath);
  data[10] = data[10] ^ 0xFF; // Flip bits
  await Deno.writeFile(matrixPath, data);

  console.log("⚠️ Attempting to import corrupted snapshot...");
  const res = await SNAPSHOT_ENGINE.importSnapshot(snap.timestamp!);
  if (res.success) {
    console.error("❌ ERROR: Corrupted snapshot was accepted!");
  } else {
    console.log("✅ SUCCESS: Corruption detected and rejected.");
  }

  // 2. ASCENSION THROTTLING TEST
  console.log("\n⚖️ Testing Ascension Throttling...");
  // Reset matrix
  STATE_MATRIX.clear();

  // Place 100 atoms with ASCEND opcode (0xFF) and high energy
  console.log("🧬 Spawning 100 Ascension candidates...");
  for (let i = 0; i < 100; i++) {
    STATE_MATRIX.setLogic(i, new Uint8Array([0xFF, 0, 0, 0, 0, 0, 0, 0]));
    STATE_MATRIX.setEnergy(i, 1000);
    STATE_MATRIX.setX(i, 500);
    STATE_MATRIX.setY(i, 500);
    // Set ID to activate
    new BigUint64Array(STATE_MATRIX.buffer, IDS_OFFSET, 100)[i] =
      BigInt(i + 1);
  }

  console.log("🌀 Triggering Pulse Tick...");
  await PULSE.tick();

  const activeIndices = STATE_MATRIX.getActiveIndices();
  const ascendedCount = 100 - activeIndices.length;

  console.log(
    `📊 Ascended: ${ascendedCount} | Remaining: ${activeIndices.length}`,
  );
  if (ascendedCount === 64) {
    console.log("✅ SUCCESS: Ascension was throttled at 64.");
  } else {
    console.error(
      `❌ ERROR: Ascension Throttling failed (Expected 64, got ${ascendedCount})`,
    );
  }

  Deno.exit(0);
}

runTest();
