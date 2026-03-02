// OMEGA-64 | test_morpho.ts | Absolute Coherence Verification
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";
import { SPATIAL_HASH } from "./SPATIAL_HASH.ts";

const ISA_BIND = 0x40;
const ISA_SHARE = 0x41;

async function runTest() {
    console.log("🧬 Starting Phase 8: Synaptic Morphogenesis Verification...");

    await PULSE.initWorkers();
    STATE_MATRIX.clear();

    const idxA = 1; 
    STATE_MATRIX.setId(idxA, 1n);
    STATE_MATRIX.setX(idxA, 500);
    STATE_MATRIX.setY(idxA, 500);
    STATE_MATRIX.setEnergy(idxA, 10);
    
    const idxB = 2;
    STATE_MATRIX.setId(idxB, 2n);
    STATE_MATRIX.setX(idxB, 500); // Identical to A to eliminate drift issues in test
    STATE_MATRIX.setY(idxB, 500);
    STATE_MATRIX.setEnergy(idxB, 5);

    const logicA = new Uint8Array([ISA_BIND, 0, 0, 0, 0, 0, 0, 0]);
    STATE_MATRIX.setLogic(idxA, logicA);
    const logicB = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
    STATE_MATRIX.setLogic(idxB, logicB);
    
    console.log(`📡 Atom A (1) at (500,500) E:10.0 | Logic: ISA_BIND`);
    console.log(`📡 Atom B (2) at (500,500) E:5.0  | Passive`);

    console.log("🕸️ Priming Spatial Lattice...");
    SPATIAL_HASH.build([idxA, idxB]);

    // TICK 1: WASM Kernel execution
    console.log("\n🌀 TICK 1: WASM Kernel execution...");
    await PULSE.tick();
    
    const req = STATE_MATRIX.getBondRequest(idxA);
    if (req) {
        console.log(`✅ Bond request found! Initiator: ${req[0]-1}, Target: ${req[1]}`);
    } else {
        console.log("❌ Bond request FAIL (null)");
    }

    // TICK 2: Host Resolution & Share Logic
    console.log("\n🌀 TICK 2: Host Resolution & Share Logic...");
    const logicA2 = new Uint8Array([ISA_SHARE, 0, 0, 0, 0, 0, 0, 0]);
    STATE_MATRIX.setLogic(idxA, logicA2);
    
    await PULSE.tick();
    
    const target = STATE_MATRIX.getBondTarget(idxA, 0);
    const stiffness = STATE_MATRIX.getBondStiffness(idxA, 0);
    const energyA = STATE_MATRIX.getEnergy(idxA);
    const energyB = STATE_MATRIX.getEnergy(idxB);

    if (target === idxB) {
        console.log(`✅ Bond established! Target: ${target}, Stiffness: ${stiffness.toFixed(3)}`);
        console.log(`📊 Energy A: ${energyA.toFixed(1)}, Energy B: ${energyB.toFixed(1)}`);
        if (energyB > 5.0) {
            console.log("✅ Metabolic sharing SUCCESS");
        } else {
            console.log("❌ Metabolic sharing FAIL (Energy B did not increase)");
        }
    } else {
        console.log(`❌ Bond establishment FAIL. Target: ${target}`);
    }

    Deno.exit(0);
}

runTest();
