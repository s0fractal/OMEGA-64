// OMEGA-64 | test_automaton.ts | Phase 24: Pure Automaton Verification
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";
import { GATE } from "./GATE.ts";

async function runTest() {
    console.log("🧪 OMEGA-64 | TEST_AUTOMATON | Starting...");

    // Initialize Pulse Workers
    await PULSE.initWorkers();

    // 1. Check for Avatar (Divine Entity)
    const active = STATE_MATRIX.getActiveIndices();
    const avatarId = 0x00000000AAAAAAAAn;
    let foundAvatar = false;
    for (const idx of active) {
        if (STATE_MATRIX.getId(idx) === avatarId) {
            foundAvatar = true;
            break;
        }
    }

    if (foundAvatar) {
        console.error("❌ TEST_FAILED: Avatar atom found in the matrix! (Divine removal failed)");
        Deno.exit(1);
    } else {
        console.log("✅ SUCCESS: No Avatar atom found. The system is a Pure Automaton.");
    }

    // 2. Inject a "Corrupted" (Zombie) Atom
    const zIdx = STATE_MATRIX.findFreeSlot();
    if (zIdx !== -1) {
        console.log(`⚖️ Injecting Malignant Zombie Atom at index ${zIdx} (Excessive FEED OP-codes)...`);
        STATE_MATRIX.setId(zIdx, 0xDEADC0DEn);
        STATE_MATRIX.setEnergy(zIdx, 100); // Give it some energy so it's not recycled by health check
        STATE_MATRIX.setLogic(zIdx, new Uint8Array([0x20, 0x20, 0x20, 0x20, 0x20, 0x00, 0x00, 0x00])); // 5 FEED ops
    }

    // 3. Run Pulse Cycles
    console.log("🌊 Running 10 Pulse Ticks to trigger Gate Audit...");
    for (let i = 0; i < 10; i++) {
        await PULSE.tick();
    }

    // 4. Verify Zombie Removal
    if (STATE_MATRIX.getId(zIdx) === 0n) {
        console.log("✅ SUCCESS: Zombie atom was recycled by the Autonomous Gate.");
    } else {
        console.error(`❌ TEST_FAILED: Zombie atom at index ${zIdx} still exists! (Gate audit failed)`);
        Deno.exit(1);
    }

    console.log("🏁 OMEGA-64 | TEST_AUTOMATON | PASSED");
    Deno.exit(0);
}

runTest().catch(e => {
    console.error(e);
    Deno.exit(1);
});
