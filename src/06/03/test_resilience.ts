// OMEGA-64 | test_resilience.ts | Era 68: Resilience Verification
import { MX } from "@generated";
import { PULSE } from "@02";
import { SNAPSHOT_ENGINE } from "@06";
import { IDS_OFFSET } from "@generated";
import { RIBOSOME } from "@02";

async function runTest() {
  console.log("🏎️ Starting Phase 12: Systemic Resilience Verification...");

  // 1. SNAPSHOT INTEGRITY TEST
  console.log("\n🛡️ Testing Snapshot Integrity...");
  MX.clear();
  await PULSE.initWorkers();
  // Set some dummy data
  MX.setEnergy(1, 999);
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
  MX.clear();

  // Place 100 atoms with ASCEND opcode (0xFF) and high energy
  console.log("🧬 Spawning 100 Ascension candidates...");
  for (let i = 0; i < 100; i++) {
    MX.setLogic(i, new Uint8Array([0xFF, 0, 0, 0, 0, 0, 0, 0]));
    MX.setEnergy(i, 1000);
    MX.setX(i, 500);
    MX.setY(i, 500);
    // Set ID to activate
    new BigUint64Array(MX.buffer, IDS_OFFSET, 100)[i] =
      BigInt(i + 1);
  }

  console.log("🌀 Triggering Pulse Tick...");
  await PULSE.tick();

  const activeIndices = MX.getActiveIndices();
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
