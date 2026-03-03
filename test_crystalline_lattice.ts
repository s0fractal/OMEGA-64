// OMEGA-64 | test_crystalline_lattice.ts | Vector 8 Verification
import { STATE_MATRIX, MAX_ATOMS } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";
import * as OFFSETS from "./OFFSETS.ts";
import process from "node:process";

async function test_crystalline_lattice() {
    console.log("💎 [TEST] Starting Crystalline Lattice (WASM Grid) Verification...");

    // 1. Initialize System
    await PULSE.initWorkers();
    
    // 2. Test Spatial Hashing
    console.log("   [TEST] Testing Spatial hashing...");
    // Clear matrix
    for (let i = 0; i < MAX_ATOMS; i++) {
        STATE_MATRIX.setId(i, 0n);
    }

    // Spawn 10 atoms in a grid cell (e.g. 50, 50 -> cell 5, 5)
    const genome = new Uint8Array(8);
    for (let i = 0; i < 10; i++) {
        STATE_MATRIX.seedAtom(i + 1, BigInt(i + 1), 55, 55, 1000, 0, genome);
    }
    
    // Pulse to trigger build_spatial_hash (now called within tick)
    await PULSE.tick();

    // Check spatial grid memory
    const cellIdx = 5 * 140 + 5;
    const offset = OFFSETS.SPATIAL_GRID_OFFSET + (cellIdx << 7);
    const gridView = new Int32Array(STATE_MATRIX.buffer, offset, 32);
    const count = Atomics.load(gridView, 0);
    
    console.log(`   [TEST] Cell (5,5) count: ${count} (Expected: 10)`);
    if (count !== 10) {
        console.error("   [FAIL] Spatial hash count mismatch.");
    } else {
        console.log("   [PASS] Spatial hash verified.");
    }

    // 3. Test Structure Grid
    console.log("   [TEST] Testing Structure Grid propagation...");
    // Reset structure grid
    const structureView = new Int32Array(STATE_MATRIX.buffer, OFFSETS.STRUCTURE_GRID_OFFSET, 140 * 80);
    for (let i = 0; i < 140 * 80; i++) structureView[i] = 0;

    // Place SOURCE at (0,0) and WIRE from (1,0) to (5,0)
    // Structure format: (State << 24) | (Charge << 16) | Type
    structureView[0] = 4; // SOURCE
    for (let x = 1; x <= 5; x++) {
        structureView[x] = 1; // WIRE
    }

    // Run 5 ticks to propagate
    for (let i = 0; i < 5; i++) {
        await PULSE.tick();
    }

    // Check charge at (5,0)
    const endCharge = (structureView[5] >> 16) & 0xFF;
    console.log(`   [TEST] End of wire charge at (5,0): ${endCharge} (Expected: > 0)`);
    if (endCharge > 0) {
        console.log("   [PASS] Structure propagation verified.");
    } else {
        console.error("   [FAIL] No charge reached end of wire.");
    }

    // 4. Test Role Quorum (Vector 8.5)
    const qOffset = OFFSETS.QUORUM_OFFSET + (cellIdx << 5);
    const quorumView = new Int32Array(STATE_MATRIX.buffer, qOffset, 8);
    // Role 0 is default
    const role0Count = Atomics.load(quorumView, 0);
    console.log(`   [TEST] Role 0 quorum in cell (5,5): ${role0Count} (Expected: 10)`);
    if (role0Count === 10) {
        console.log("   [PASS] Role quorum verified.");
    } else {
        console.error("   [FAIL] Role quorum mismatch.");
    }

    console.log("💎 [TEST] Verification Complete.");
    process.exit(0);
}

test_crystalline_lattice().catch(err => {
    console.error("   [TEST CRASH]", err);
    process.exit(1);
});
