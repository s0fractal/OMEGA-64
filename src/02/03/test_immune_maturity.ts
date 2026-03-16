// OMEGA-64 | test_immune_maturity.ts | Stage 26: Immune System Maturity Verification
import { MAX_ATOMS, SCALE, MX, LOGGER, Li, Le } from "@g";
import {
  IMMUNE
} from "@g";

async function runTest() {
  Li(
    "🧪 [TEST] Starting Immune System Maturity (Stage 26) Verification...",
  );

  // --- 1. Setup Test Environment ---
  Li(
    "Step 1: Seeding matrix with healthy, necrotic, and drifting atoms...",
  );

  // Clear matrix first
  MX.clear();

  // 1. Healthy Atom (Index 10)
  MX.setId(10, 100n);
  MX.setEnergy(10, 50.0);
  MX.setResonance(10, 10000); // 100.0 resonance

  // 2. Necrotic Atom (Index 20) - Energy = 0, Resonance = 0
  MX.setId(20, 200n);
  MX.setEnergy(20, 0);
  MX.setResonance(20, 0);

  // 3. Drifting Atom (Index 30) - Low energy, low resonance
  MX.setId(30, 300n);
  MX.setEnergy(30, 1.5);
  MX.setResonance(30, 50); // Raw resonance 50 (very low)

  // 4. Stable but Weak Atom (Index 40)
  MX.setId(40, 400n);
  MX.setEnergy(40, 3.0);
  MX.setResonance(40, 2000); // Raw resonance 2000

  // --- 2. Test isNecrotic ---
  Li("Step 2: Testing isNecrotic detection...");
  if (IMMUNE.isNecrotic(20) && !IMMUNE.isNecrotic(10)) {
    Li("✅ isNecrotic correctly identified necrotic atom.");
  } else {
    Le(
      "❌ isNecrotic failed to identify necrotic atom or returned false positive.",
    );
  }

  // --- 3. Test Phagocyte Pass (Low Entropy) ---
  Li("Step 3: Testing Phagocyte Pass at low entropy (H0=100)...");
  // At H0=100, threshold = (100/1000) * 2.0 = 0.2
  // Necrotic (20) should be purged.
  // Drifting (30) has energy 1.5, will NOT be purged (1.5 > 0.2).
  const purgeList1 = IMMUNE.phagocytePass(100);
  Li(`Purge list (H0=100): [${purgeList1.join(", ")}]`);
  if (purgeList1.includes(20) && !purgeList1.includes(30)) {
    Li(
      "✅ Phagocyte pass correctly identifies only necrotic atoms at low entropy.",
    );
  } else {
    Le("❌ Phagocyte pass failed at low entropy.");
  }

  // --- 4. Test Phagocyte Pass (High Entropy) ---
  Li("Step 4: Testing Phagocyte Pass at high entropy (H0=900)...");
  // At H0=900, threshold = (900/1000) * 2.0 = 1.8
  // Necrotic (20) should be purged.
  // Drifting (30) has energy 1.5, should be purged (1.5 < 1.8 AND 50 < 180).
  // Stable (40) has energy 3.0, should remain.
  const purgeList2 = IMMUNE.phagocytePass(900);
  Li(`Purge list (H0=900): [${purgeList2.join(", ")}]`);
  if (
    purgeList2.includes(20) && purgeList2.includes(30) &&
    !purgeList2.includes(40)
  ) {
    Li("✅ Phagocyte pass correctly scales with entropy pressure.");
  } else {
    Le("❌ Phagocyte pass failed to scale correctly with entropy.");
  }

  // --- 5. Test recycleAtom ---
  Li("Step 5: Testing recycleAtom execution...");
  MX.recycleAtom(30);
  if (MX.getId(30) === 0n && MX.getEnergy(30) === 0) {
    Li("✅ recycleAtom successfully cleared atom data.");
  } else {
    Le("❌ recycleAtom failed to clear atom data.");
  }

  Li(
    "✅ Immune System Maturity (Stage 26) Verification Script Completed.",
  );
}

if (import.meta.main) {
  runTest().catch(console.error);
}
