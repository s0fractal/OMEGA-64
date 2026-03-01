import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";
import { ISA } from "./LAMBDA_VM.ts";

/**
 * ERA 45: Symbiotic Merging Verification
 * 1. Spawn two atoms.
 * 2. Force a bond and high stiffness.
 * 3. Trigger ISA.MERGE.
 * 4. Verify fusion results (Single-Pulse Resolution).
 */

async function testSymbiosis() {
    console.log("🌀 OMEGA-64 | Commencing Symbiogenesis Verification (Era 45) 🌀\n");

    STATE_MATRIX.clear();
    
    // 1. Spawn Initiator (Atom 1)
    const a1 = STATE_MATRIX.findEmptySlot();
    STATE_MATRIX.setId(a1, 0x1n);
    STATE_MATRIX.setX(a1, 500);
    STATE_MATRIX.setY(a1, 500);
    STATE_MATRIX.setEnergy(a1, 500);
    STATE_MATRIX.setResonance(a1, 600); // High resonance required for merge
    STATE_MATRIX.setLogic(a1, new Uint8Array([0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA, 0xAA]));

    // Code for A1: MERGE with bond slot 0
    const code1 = new Uint32Array(16);
    code1[0] = (0 << 16) | (0 << 8) | ISA.MERGE; // MERGE slot 0
    code1[1] = (1 << 8) | ISA.JMP; // Halt at PC 1
    STATE_MATRIX.setCode(a1, code1);

    // 2. Spawn Target (Atom 2)
    const a2 = STATE_MATRIX.findEmptySlot();
    STATE_MATRIX.setId(a2, 0x2n);
    STATE_MATRIX.setX(a2, 510);
    STATE_MATRIX.setY(a2, 510);
    STATE_MATRIX.setEnergy(a2, 200);
    STATE_MATRIX.setResonance(a2, 100);
    STATE_MATRIX.setLogic(a2, new Uint8Array([0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55]));

    // 3. Establish pre-existing bond with high stiffness
    STATE_MATRIX.setBondTarget(a1, 0, a2);
    STATE_MATRIX.setBondTarget(a2, 0, a1);
    STATE_MATRIX.setBondStiffness(a1, 0, 0.9); // High stiffness required
    STATE_MATRIX.setBondStiffness(a2, 0, 0.9);

    console.log("--- Initial State ---");
    console.log(`Atom 1 (Initiator) Energy: ${STATE_MATRIX.getEnergy(a1)} | Res: ${STATE_MATRIX.getResonance(a1)}`);
    console.log(`Atom 2 (Target) Energy: ${STATE_MATRIX.getEnergy(a2)} | Res: ${STATE_MATRIX.getResonance(a2)}`);

    PULSE.initWorkers();

    // Pulse 1: Worker executes MERGE intent + Main thread resolves it
    console.log("\n--- Pulse 1: Execution & Resolution ---");
    await PULSE.tick();
    
    // Check results immediately
    const id2 = STATE_MATRIX.getId(a2);
    const energy1 = STATE_MATRIX.getEnergy(a1);
    const bonus1 = STATE_MATRIX.getSemanticBonus(a1);
    const logic1 = STATE_MATRIX.getLogic(a1);

    if (id2 === 0n) {
        console.log("✅ SUCCESS: Target Atom 2 has been absorbed (Necrosis).");
    } else {
        console.error("❌ FAILED: Target Atom 2 still exists.");
    }

    if (energy1 > 600) {
        console.log(`✅ SUCCESS: Initiator Energy combined to ${energy1} (Metabolism Fused).`);
    } else {
        console.error(`❌ FAILED: Initiator Energy did not increase as expected. Found: ${energy1}`);
    }

    if ((bonus1 & 0x08) === 0x08) {
        console.log("✅ SUCCESS: Initiator gained SYMBIOTIC bonus bit.");
    } else {
        console.error("❌ FAILED: Initiator missing bonus bit.");
    }

    // Genetic XOR check: 0xAA ^ 0x55 = 0xFF
    if (logic1[0] === 0xFF) {
        console.log("✅ SUCCESS: Genomes XOR-recombined correctly (0xAA ^ 0x55 = 0xFF).");
    } else {
        console.error(`❌ FAILED: Genetic recombination failed. Found: 0x${logic1[0].toString(16)}`);
    }

    // Check phantom metabolism: Atom 1's bond slot 0 should be 0
    if (STATE_MATRIX.getBondTarget(a1, 0) === 0) {
        console.log("✅ SUCCESS: Bond with target has been severed.");
    } else {
        console.error("❌ FAILED: Bond with dead target still exists (Phantom Metabolism risk).");
    }

    console.log("\n🌀 Symbiogenesis Verification Complete. 🌀");
    Deno.exit(0);
}

testSymbiosis();
