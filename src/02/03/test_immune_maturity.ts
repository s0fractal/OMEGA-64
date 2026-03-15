// OMEGA-64 | test_immune_maturity.ts | Stage 26: Immune System Maturity Verification
import { MAX_ATOMS, SCALE, STATE_MATRIX } from "@generated";
import { IMMUNE } from "@generated";
import { LOGGER } from "@generated";

async function runTest() {
  LOGGER.info(
    "🧪 [TEST] Starting Immune System Maturity (Stage 26) Verification...",
  );

  // --- 1. Setup Test Environment ---
  LOGGER.info(
    "Step 1: Seeding matrix with healthy, necrotic, and drifting atoms...",
  );

  // Clear matrix first
  STATE_MATRIX.clear();

  // 1. Healthy Atom (Index 10)
  STATE_MATRIX.setId(10, 100n);
  STATE_MATRIX.setEnergy(10, 50.0);
  STATE_MATRIX.setResonance(10, 10000); // 100.0 resonance

  // 2. Necrotic Atom (Index 20) - Energy = 0, Resonance = 0
  STATE_MATRIX.setId(20, 200n);
  STATE_MATRIX.setEnergy(20, 0);
  STATE_MATRIX.setResonance(20, 0);

  // 3. Drifting Atom (Index 30) - Low energy, low resonance
  STATE_MATRIX.setId(30, 300n);
  STATE_MATRIX.setEnergy(30, 1.5);
  STATE_MATRIX.setResonance(30, 50); // Raw resonance 50 (very low)

  // 4. Stable but Weak Atom (Index 40)
  STATE_MATRIX.setId(40, 400n);
  STATE_MATRIX.setEnergy(40, 3.0);
  STATE_MATRIX.setResonance(40, 2000); // Raw resonance 2000

  // --- 2. Test isNecrotic ---
  LOGGER.info("Step 2: Testing isNecrotic detection...");
  if (IMMUNE.isNecrotic(20) && !IMMUNE.isNecrotic(10)) {
    LOGGER.info("✅ isNecrotic correctly identified necrotic atom.");
  } else {
    LOGGER.error(
      "❌ isNecrotic failed to identify necrotic atom or returned false positive.",
    );
  }

  // --- 3. Test Phagocyte Pass (Low Entropy) ---
  LOGGER.info("Step 3: Testing Phagocyte Pass at low entropy (H0=100)...");
  // At H0=100, threshold = (100/1000) * 2.0 = 0.2
  // Necrotic (20) should be purged.
  // Drifting (30) has energy 1.5, will NOT be purged (1.5 > 0.2).
  const purgeList1 = IMMUNE.phagocytePass(100);
  LOGGER.info(`Purge list (H0=100): [${purgeList1.join(", ")}]`);
  if (purgeList1.includes(20) && !purgeList1.includes(30)) {
    LOGGER.info(
      "✅ Phagocyte pass correctly identifies only necrotic atoms at low entropy.",
    );
  } else {
    LOGGER.error("❌ Phagocyte pass failed at low entropy.");
  }

  // --- 4. Test Phagocyte Pass (High Entropy) ---
  LOGGER.info("Step 4: Testing Phagocyte Pass at high entropy (H0=900)...");
  // At H0=900, threshold = (900/1000) * 2.0 = 1.8
  // Necrotic (20) should be purged.
  // Drifting (30) has energy 1.5, should be purged (1.5 < 1.8 AND 50 < 180).
  // Stable (40) has energy 3.0, should remain.
  const purgeList2 = IMMUNE.phagocytePass(900);
  LOGGER.info(`Purge list (H0=900): [${purgeList2.join(", ")}]`);
  if (
    purgeList2.includes(20) && purgeList2.includes(30) &&
    !purgeList2.includes(40)
  ) {
    LOGGER.info("✅ Phagocyte pass correctly scales with entropy pressure.");
  } else {
    LOGGER.error("❌ Phagocyte pass failed to scale correctly with entropy.");
  }

  // --- 5. Test recycleAtom ---
  LOGGER.info("Step 5: Testing recycleAtom execution...");
  STATE_MATRIX.recycleAtom(30);
  if (STATE_MATRIX.getId(30) === 0n && STATE_MATRIX.getEnergy(30) === 0) {
    LOGGER.info("✅ recycleAtom successfully cleared atom data.");
  } else {
    LOGGER.error("❌ recycleAtom failed to clear atom data.");
  }

  LOGGER.info(
    "✅ Immune System Maturity (Stage 26) Verification Script Completed.",
  );
}

if (import.meta.main) {
  runTest().catch(console.error);
}
