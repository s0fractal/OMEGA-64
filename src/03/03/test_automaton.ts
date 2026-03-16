// OMEGA-64 | test_automaton.ts | Phase 24: Pure Automaton Verification
import { MX } from "@g";
import { PULSE } from "@g";
import { GATE } from "@g";

async function runTest() {
  console.log("🧪 OMEGA-64 | TEST_AUTOMATON | Starting...");

  // Initialize Pulse Workers
  await PULSE.initWorkers();

  // 1. Check for Avatar (Divine Entity)
  const active = MX.getActiveIndices();
  const avatarId = 0x00000000AAAAAAAAn;
  let foundAvatar = false;
  for (const idx of active) {
    if (MX.getId(idx) === avatarId) {
      foundAvatar = true;
      break;
    }
  }

  if (foundAvatar) {
    console.error(
      "❌ TEST_FAILED: Avatar atom found in the matrix! (Divine removal failed)",
    );
    Deno.exit(1);
  } else {
    console.log(
      "✅ SUCCESS: No Avatar atom found. The system is a Pure Automaton.",
    );
  }

  // 2. Inject a "Corrupted" (Zombie) Atom
  const zIdx = MX.findFreeSlot();
  if (zIdx !== -1) {
    console.log(
      `⚖️ Injecting Malignant Zombie Atom at index ${zIdx} (Excessive FEED OP-codes)...`,
    );
    MX.setId(zIdx, 0xDEADC0DEn);
    MX.setEnergy(zIdx, 100); // Give it some energy so it's not recycled by health check
    MX.setLogic(
      zIdx,
      new Uint8Array([0x20, 0x20, 0x20, 0x20, 0x20, 0x00, 0x00, 0x00]),
    ); // 5 FEED ops
  }

  // 3. Run Pulse Cycles
  console.log("🌊 Running 10 Pulse Ticks to trigger Gate Audit...");
  for (let i = 0; i < 10; i++) {
    await PULSE.tick();
  }

  // 4. Verify Zombie Removal
  if (MX.getId(zIdx) === 0n) {
    console.log("✅ SUCCESS: Zombie atom was recycled by the Autonomous Gate.");
  } else {
    console.error(
      `❌ TEST_FAILED: Zombie atom at index ${zIdx} still exists! (Gate audit failed)`,
    );
    Deno.exit(1);
  }

  console.log("🏁 OMEGA-64 | TEST_AUTOMATON | PASSED");
  Deno.exit(0);
}

runTest().catch((e) => {
  console.error(e);
  Deno.exit(1);
});
