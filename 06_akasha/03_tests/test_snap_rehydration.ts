// OMEGA-64 | test_snap_rehydration.ts | Era 71: The Quantum Snap
import { sharedBuffer, STATE_MATRIX } from "../../00_substrate/mod.ts";
import { SNAP_ENGINE } from "../mod.ts";
import { seedSeededSwarmScenario } from "../../02_metabolism/mod.ts";
import { LOGGER } from "../../00_substrate/mod.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { crypto } from "https://deno.land/std@0.224.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.224.0/encoding/hex.ts";

async function computeBufferHash(buffer: SharedArrayBuffer): Promise<string> {
  const data = new Uint8Array(buffer.byteLength);
  data.set(new Uint8Array(buffer));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return encodeHex(hash);
}

async function main() {
  LOGGER.info("🧪 [TEST] Starting Snap Rehydration Parity Test...");

  // 1. Setup & Seed
  const replicators = 10;
  const architects = 5;
  seedSeededSwarmScenario(STATE_MATRIX as any, {
    seed: 424242,
    replicators,
    architects,
  });

  const originalActiveCount = STATE_MATRIX.getActiveIndices().length;
  LOGGER.info(`   - Seeded ${originalActiveCount} atoms.`);

  // 2. Capture Original State Hash
  const hashA = await computeBufferHash(sharedBuffer);
  LOGGER.info(`   - Original Hash: ${hashA}`);

  // 3. Save Snap
  const snapPath = await SNAP_ENGINE.save(1);
  if (!snapPath) throw new Error("Snap save failed");

  // 4. Sabotage/Clear Matrix
  LOGGER.info("   - Clearing matrix...");
  STATE_MATRIX.clear();
  const clearedActiveCount = STATE_MATRIX.getActiveIndices().length;
  assertEquals(clearedActiveCount, 0, "Matrix should be empty after clear");

  const hashB = await computeBufferHash(sharedBuffer);
  LOGGER.info(`   - Cleared Hash: ${hashB}`);
  if (hashA === hashB) throw new Error("Hash should change after clear");

  // 5. Load Snap
  LOGGER.info(`   - Loading snap from ${snapPath}...`);
  const loadOk = await SNAP_ENGINE.load(snapPath);
  if (!loadOk) throw new Error("Snap load failed");

  // 6. Verify Parity
  const hashC = await computeBufferHash(sharedBuffer);
  LOGGER.info(`   - Re-hydrated Hash: ${hashC}`);

  const finalActiveCount = STATE_MATRIX.getActiveIndices().length;
  assertEquals(
    finalActiveCount,
    originalActiveCount,
    "Active count must match after re-hydration",
  );
  assertEquals(
    hashC,
    hashA,
    "BIT-IDENTICAL PARITY FAILED: Re-hydrated hash does not match original",
  );

  LOGGER.info(
    "✅ [TEST] Snap Rehydration Parity Verified! Bit-identical resonance achieved.",
  );

  // Cleanup test snap
  await Deno.remove(snapPath);
}

main().catch((err) => {
  LOGGER.error("❌ [TEST] Snap Verfication FAILED:", err);
  Deno.exit(1);
});
