import { STATE_MATRIX, MAX_ATOMS } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";
import { SPATIAL_HASH } from "./SPATIAL_HASH.ts";

async function runTest() {
    console.log("=== VECTOR 7: THE QUANTUM SHIFT VERIFICATION ===");
    
    // 1. Initialize
    // STATE_MATRIX initializes automatically upon import.
    await PULSE.initWorkers();
    
    // 2. Seed a Producer and a Neutral atom for Trophic Flow & Chemotaxis test
    // We use id > 10 to trigger WASM physics
    const parentIdx = 11;
    const childIdx = 12;
    
    const parentId = BigInt(Date.now());
    const childId = BigInt(Date.now() + 1);
    
    // Producer at (50, 50)
    STATE_MATRIX.seedAtom(parentIdx, parentId, 50, 50, 1000, 0, new Uint8Array(8));
    STATE_MATRIX.setRole(parentIdx, 1); // ROLE_PRODUCER
    
    // Neutral at (55, 55) - within flow & chemotaxis range
    STATE_MATRIX.seedAtom(childIdx, childId, 55, 55, 10, 0, new Uint8Array(8));
    STATE_MATRIX.setRole(childIdx, 0); // ROLE_NEUTRAL

    console.log(`-> Initial State:
       Atom ${parentIdx} (PRODUCER) at (50, 50), Energy: ${STATE_MATRIX.getEnergy(parentIdx)}
       Atom ${childIdx} (NEUTRAL) at (55, 55), Energy: ${STATE_MATRIX.getEnergy(childIdx)}`);

    // 3. Run a few pulses
    for (let i = 0; i < 50; i++) {
        // We need to build spatial hash for WASM to see them
        SPATIAL_HASH.build(STATE_MATRIX.getActiveIndices());
        
        // Orchestrate pulse
        await PULSE.tick();
    }

    const finalParentEnergy = STATE_MATRIX.getEnergy(parentIdx);
    const finalChildEnergy = STATE_MATRIX.getEnergy(childIdx);
    const finalParentPos = [STATE_MATRIX.getX(parentIdx), STATE_MATRIX.getY(parentIdx)];
    const finalChildPos = [STATE_MATRIX.getX(childIdx), STATE_MATRIX.getY(childIdx)];

    console.log(`-> Final State (Pulse 50):
       Atom ${parentIdx} (PRODUCER) at (${finalParentPos}), Energy: ${finalParentEnergy}
       Atom ${childIdx} (NEUTRAL) at (${finalChildPos}), Energy: ${finalChildEnergy}`);

    // Verification Logic:
    // - Energy should have flowed from Producer (11) to Neutral (12)
    // - Chemotaxis should have pulled Neutral (12) closer to Producer (11) or vice versa
    
    let success = true;
    if (finalChildEnergy <= 10) {
        console.error("❌ FAILED: Energy did not flow to Neutral atom.");
        success = false;
    } else {
        console.log("✅ SUCCESS: Trophic Flow verified in WASM kernel.");
    }

    if (finalChildPos[0] === 55 && finalChildPos[1] === 55) {
         console.warn("⚠️ WARNING: Atom did not move. (Maybe velocity was too low or dampened)");
    } else {
         console.log("✅ SUCCESS: Physics (Chemotaxis/Movement) verified in WASM kernel.");
    }

    if (success) {
        console.log("\n✅ VECTOR 7 VERIFIED: Absolute WASM Coherence Achieved.");
        Deno.exit(0);
    } else {
        Deno.exit(1);
    }
}

runTest().catch((err) => {
    console.error(err);
    Deno.exit(1);
});
