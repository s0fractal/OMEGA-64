// OMEGA-64 | test_swarm.ts | Vector 3 Verification
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import * as OFFSETS from "./OFFSETS.ts";

async function runTest() {
    console.log("=== VECTOR 3: COLLECTIVE INTELLIGENCE & ROLES TEST ===");

    // 1. Initialize State
    STATE_MATRIX.clear();
    const sharedBuffer = STATE_MATRIX.buffer;
    const wasmMemory = STATE_MATRIX.wasmMemory;

    // Load WASM
    const wasmRes = await fetch(new URL("./build/release.wasm", import.meta.url).href);
    const wasmBytes = await wasmRes.arrayBuffer();
    const { instance } = await WebAssembly.instantiate(wasmBytes, {
        env: {
            memory: wasmMemory,
            abort: () => {},
            trace_atom: (idx: number, op: number, p1: number, p2: number, p3: number) => {
                console.log(`   [TR] Atom ${idx} | OP: 0x${op.toString(16)} | P1: ${p1} | P2: ${p2} | P3: ${p3}`);
            }
        }
    });

    const execute_atom = instance.exports.execute_atom as (i: number) => void;

    // 2. Setup Specialized Atoms
    // Atom 0: PRODUCER (Role 1) - Attracted to Energy
    // Atom 1: GUARDIAN (Role 2) - Attracted to Resonance
    
    // Logic: 
    // OP_ROLE mode=0, val=1 (Set Producer)
    // OP_COLLECTIVE mode=0, addr=1, val=88 (Store 88 in Hive)
    const scriptA = new Uint8Array(64);
    scriptA[0] = 0xA7; scriptA[1] = 0; scriptA[2] = 1; // ROLE 1
    scriptA[3] = 0xA6; scriptA[4] = 0; scriptA[5] = 1; scriptA[6] = 88; // HIVE STORE [1] = 88

    // Atom 1: Logic:
    // OP_ROLE mode=0, val=2 (Set Guardian)
    // OP_COLLECTIVE mode=1, addr=1, reg=0 (Load Hive [1] into R0)
    const scriptB = new Uint8Array(64);
    scriptB[0] = 0xA7; scriptB[1] = 0; scriptB[2] = 2; // ROLE 2
    scriptB[3] = 0xA6; scriptB[4] = 1; scriptB[5] = 1; scriptB[6] = 0; // HIVE LOAD [1] -> R0

    STATE_MATRIX.seedAtom(0, 1n, 100, 100, 5000, 100, undefined, scriptA);
    STATE_MATRIX.seedAtom(1, 2n, 110, 100, 5000, 100, undefined, scriptB);

    // Initial check
    console.log("-> Roles assigned: Atom0=", STATE_MATRIX.getRole(0), "Atom1=", STATE_MATRIX.getRole(1));

    // 3. Setup Environment
    // High Energy to the RIGHT (Energy Trophism for Producer)
    // High Resonance to the LEFT (Resonance Trophism for Guardian)
    // (Actual trophism is calculated in PHYSICS_ENGINE / PULSE_WORKER)
    // In this unit test, we'll manually check the trophism calculation logic 
    // or run a simulation step if we had the full loop.
    // For now, let's verify OP_COLLECTIVE and ROLE assignment via WASM.

    console.log("-> Executing Atoms...");
    execute_atom(0); // Atom 0 sets role and stores in hive
    execute_atom(1); // Atom 1 sets role and loads from hive

    console.log("-> Verification:");
    console.log("   Atom 0 Role:", STATE_MATRIX.getRole(0), "(Expected: 1)");
    console.log("   Atom 1 Role:", STATE_MATRIX.getRole(1), "(Expected: 2)");
    
    // Check Hive Memory
    const hiveView = new Uint8Array(sharedBuffer, OFFSETS.HIVE_MEMORY_OFFSET, 1024);
    console.log("   Hive Memory [1]:", hiveView[1], "(Expected: 88)");

    // Check Atom 1 Register 0 (Loaded from Hive)
    // Context per atom is 64 bytes. R0 is at the start of that.
    // Atom 1 offset = 64.
    const regsView = new Int32Array(sharedBuffer, OFFSETS.CONTEXT_OFFSET + 64, 8);
    console.log("   Atom 1 Reg 0:", regsView[0], "(Expected: 88)");

    // 4. Verify Pheromone Emission
    // Atom 0: OP_COLLECTIVE mode=2, intensity=200, type=5 (Pheromone Emit)
    const scriptC = new Uint8Array(64);
    scriptC[0] = 0xA6; scriptC[1] = 2; scriptC[2] = 200; scriptC[3] = 5;
    STATE_MATRIX.setInstructions(0, scriptC);
    STATE_MATRIX.setPC(0, 0);
    execute_atom(0);

    const gx = Math.floor(100 / 10);
    const gy = Math.floor(100 / 10);
    const pidx = gy * 140 + gx;
    const pheroGrid = new Int32Array(sharedBuffer, OFFSETS.SIGNAL_GRID_OFFSET, 140 * 80);
    const pValue = pheroGrid[pidx];
    console.log("   Pheromone at (100,100):", pValue.toString(16), "(Expected: c805)"); // 200 << 8 | 5 = 0xC805

    if (STATE_MATRIX.getRole(0) === 1 && hiveView[1] === 88 && regsView[0] === 88 && (pValue & 0xFFFF) === 0xc805) {
        console.log("\n✅ VECTOR 3 VERIFIED: Collective Intelligence & Specialized Roles functional.");
    } else {
        console.log("\n❌ VECTOR 3 FAILURE: Stigmery or Knowledge transfer error.");
    }
}

runTest();
