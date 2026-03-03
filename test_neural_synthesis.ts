// OMEGA-64 | test_neural_synthesis.ts | Vector 9 Verification
import { STATE_MATRIX, MAX_ATOMS } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";
import * as OFFSETS from "./OFFSETS.ts";

async function test_neural_synthesis() {
    console.log("🧬 [TEST] Starting Neural Synthesis (Vector 9) Verification...");
    let failed = false;

    // 1. Initialize System
    await PULSE.initWorkers();
    
    // 2. Test OP_SIGNAL (Bio-Digital Injection)
    console.log("   [TEST] Testing OP_SIGNAL (Charge Injection)...");
    // Place atom at (20, 20) -> Cell (2, 2)
    // Genome: [OP_SET R0 255, OP_PUT R0 PROP_RESONANCE, OP_SIGNAL, OP_NOP...]
    const genome = new Uint8Array(64);
    genome[0] = 0x01; genome[1] = 0; genome[2] = 255; // OP_SET R0, 255
    genome[3] = 0x03; genome[4] = 0; genome[5] = 1;   // OP_PUT R0, PROP_RESONANCE
    genome[6] = 0x81;                                // OP_SIGNAL
    
    STATE_MATRIX.seedAtom(1, 1n, 25, 25, 1000, 0, undefined, genome);
    
    // Clear structure grid
    const structureView = new Int32Array(STATE_MATRIX.buffer, OFFSETS.STRUCTURE_GRID_OFFSET, 140 * 80);
    for (let i = 0; i < 140 * 80; i++) structureView[i] = 0;

    // Tick to execute OP_SIGNAL
    await PULSE.tick();
    
    const cellIdx = 2 * 140 + 2;
    const charge = (structureView[cellIdx] >> 16) & 0xFF;
    console.log(`   [TEST] Cell (2,2) charge after OP_SIGNAL: ${charge} (Expected: >=170)`);
    if (charge >= 170) {
        console.log("   [PASS] OP_SIGNAL verified.");
    } else {
        console.error("   [FAIL] OP_SIGNAL did not inject charge.");
        failed = true;
    }

    // 3. Test OP_BUILD (Architect Printing)
    console.log("   [TEST] Testing OP_BUILD (Architect Printing)...");
    // Architect atom at (30, 30) -> Cell (3, 3)
    // Genome: [OP_ROLE 0 3, OP_SET R0 500, OP_PUT R0 PROP_ENERGY, OP_BUILD 4 1, OP_NOP...] // Build SOURCE (type 4) at current cell
    const archGenome = new Uint8Array(64);
    archGenome[0] = 0xA7; archGenome[1] = 0; archGenome[2] = 3;   // OP_ROLE SET, 3 (ARCHITECT)
    archGenome[3] = 0xA8; archGenome[4] = 1; archGenome[5] = 0;   // OP_BUILD 1 (WIRE), state 0
    
    // Clear start of atom 2
    STATE_MATRIX.seedAtom(2, 2n, 35, 35, 1000, 1, undefined, archGenome);
    
    // Run tick to build
    await PULSE.tick();
    
    const buildIdx = 3 * 140 + 3;
    const builtType = structureView[buildIdx] & 0xFF;
    console.log(`   [TEST] Cell (3,3) structure type: ${builtType} (Expected: 1)`);
    if (builtType === 1) {
        console.log("   [PASS] OP_BUILD verified.");
    } else {
        console.error("   [FAIL] OP_BUILD did not create structure.");
        failed = true;
    }

    // 4. Test OP_COLLECTIVE (PC Synchronization)
    console.log("   [TEST] Testing OP_COLLECTIVE (Group Sync)...");
    // Two atoms in (4,4). One fires OP_COLLECTIVE (mode 6)
    // Atom 3: [OP_SIGNAL, OP_COLLECTIVE 6 0 0, OP_NOP...]
    // Atom 4: [OP_NOP, OP_NOP, OP_NOP, OP_NOP, OP_REPLICATE...]
    const syncGenome = new Uint8Array(64);
    syncGenome[0] = 0xA6; syncGenome[1] = 6; syncGenome[2] = 0; syncGenome[3] = 0; // OP_COLLECTIVE mode 6
    
    const targetGenome = new Uint8Array(64);
    // PC starts at 0. After sync, it should jump to next (4)
    
    STATE_MATRIX.seedAtom(3, 3n, 45, 45, 1000, 0, undefined, syncGenome);
    STATE_MATRIX.seedAtom(4, 4n, 45, 45, 1000, 0, undefined, targetGenome);
    
    // Run tick
    await PULSE.tick();
    
    const contextView = new Uint32Array(STATE_MATRIX.buffer, OFFSETS.CONTEXT_OFFSET, MAX_ATOMS * 16); // PC is uint32
    const atom4PC = contextView[4 * 16 / 4 + 8]; // Context offset for PC? 
    // Wait, context is 64 bytes. PC is at offset 32.
    const contextBytes = new Uint8Array(STATE_MATRIX.buffer, OFFSETS.CONTEXT_OFFSET, MAX_ATOMS * 64);
    const atom4PC_real = contextBytes[4 * 64 + 32];
    console.log(`   [TEST] Atom 4 PC after Collective Sync: ${atom4PC_real} (Expected: 4)`);
    if (atom4PC_real === 4) {
        console.log("   [PASS] OP_COLLECTIVE verified.");
    } else {
        console.error("   [FAIL] OP_COLLECTIVE did not synchronize neighbor PC.");
        failed = true;
    }

    console.log("🧬 [TEST] Neural Synthesis Verification Complete.");
    Deno.exit(failed ? 1 : 0);
}

test_neural_synthesis().catch(err => {
    console.error("   [TEST CRASH]", err);
    Deno.exit(1);
});
