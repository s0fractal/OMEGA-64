import { MX } from "@generated";
import { SNAPSHOT_ENGINE } from "@06";
import { RIBOSOME } from "@02";

console.log("📦 [TEST] Verifying Era 39: Hybrid Storage...");

async function runTest() {
  // 1. Setup mock state
  console.log("   [TEST] Seeding mock state...");
  MX.clear();
  MX.setId(0, 123456789n);
  MX.setEnergy(0, 999.0);

  // 2. Export snapshot
  console.log("   [TEST] Exporting snapshot...");
  const dump = await SNAPSHOT_ENGINE.exportSnapshot();
  if (!dump.success) {
    console.log("❌ [TEST] Failed to export snapshot.");
    Deno.exit(1);
  }

  // 3. Clear state completely
  MX.clear();
  if (MX.getId(0) === 123456789n) {
    console.log("❌ [TEST] Failed to clear state.");
    Deno.exit(1);
  }

  // 4. Test Hybrid Lift
  console.log("   [TEST] Running RIBOSOME.lift()...");
  const start = performance.now();
  const lattice = await RIBOSOME.lift(Deno.cwd(), async () => {
    const snapshots = await SNAPSHOT_ENGINE.listSnapshots();
    if (snapshots.length > 0) {
      const latest = snapshots[0];
      const status = await SNAPSHOT_ENGINE.importSnapshot(latest);
      return status.success;
    }
    return false;
  });
  const end = performance.now();

  // 5. Verify results
  const loadedId = MX.getId(0);
  const loadedEnergy = MX.getEnergy(0);

  console.log(`   [TEST] Lift took ${(end - start).toFixed(2)}ms`);
  console.log(`   [TEST] Restored ID: ${loadedId} (Target: 123456789)`);
  console.log(`   [TEST] Restored Energy: ${loadedEnergy} (Target: 999)`);

  let isHydrated = false;
  for (const atom of lattice.values()) {
    if (atom.symbol === "HYDRATED") isHydrated = true;
  }

  if (isHydrated && loadedId === 123456789n && loadedEnergy === 999.0) {
    console.log("✅ [TEST] Hybrid Storage verified. ⚡🧊");
    Deno.exit(0);
  } else {
    console.log("❌ [TEST] Hybrid Storage mismatch.");
    Deno.exit(1);
  }
}

runTest();
