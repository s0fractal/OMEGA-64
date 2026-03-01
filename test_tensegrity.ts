// OMEGA-64 | test_tensegrity.ts | Era 44 Verification
// Verifies Multi-Cellular Bond formation (Level 12 Intent -> ISA.BIND) and Metabolic Equalization.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";
import { LAMBDA_VM, ISA } from "./LAMBDA_VM.ts";
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";

console.log("🌀 OMEGA-64 | Commencing Multi-Cellular Tensegrity Verification (Era 44) 🌀");

STATE_MATRIX.clear();

// 1. spawn Central Atom (Atom 1)
const a1 = STATE_MATRIX.findEmptySlot();
STATE_MATRIX.setId(a1, 0x1n);
STATE_MATRIX.setX(a1, 500);
STATE_MATRIX.setY(a1, 500);
STATE_MATRIX.setEnergy(a1, 1000); // Central atom is rich
STATE_MATRIX.setResonance(a1, 100);
STATE_MATRIX.setLogic(a1, new Uint8Array([0x78, 0x78, 0x78, 0x78, 0x78, 0x78, 0x78, 0x78])); // Neutral velocity

// Atom 1 Code: BIND to the right (dx: 2.0, dy: 0.0)
const code1 = new Uint32Array(16);
// Encoding: (p2 << 16) | (p1 << 8) | op
// dx = 2.0 -> p1 = 128 + 20 = 148
// dy = 0.0 -> p2 = 128
code1[0] = (128 << 16) | (148 << 8) | ISA.BIND;
code1[1] = (0 << 8) | ISA.JMP; // Halt (JMP to 0 or same line is risky, let's just JMP to 1)
code1[2] = (2 << 8) | ISA.JMP; 
STATE_MATRIX.setCode(a1, code1);

// 2. spawn Right Atom (Atom 2) - very close but starving
const a2 = STATE_MATRIX.findEmptySlot();
STATE_MATRIX.setId(a2, 0x2n);
STATE_MATRIX.setX(a2, 520); // 20 units to the right
STATE_MATRIX.setY(a2, 500);
STATE_MATRIX.setEnergy(a2, 10); // Starving
STATE_MATRIX.setResonance(a2, 0);
STATE_MATRIX.setLogic(a2, new Uint8Array([0x78, 0x78, 0x78, 0x78, 0x78, 0x78, 0x78, 0x78])); // Neutral velocity

// Atom 2 Code: Just halt
const code2 = new Uint32Array(16);
code2[0] = (0 << 8) | ISA.JMP; 
STATE_MATRIX.setCode(a2, code2);


console.log(`\n--- Initial State ---`);
console.log(`Atom 1: [${STATE_MATRIX.getX(a1)}, ${STATE_MATRIX.getY(a1)}] Energy: ${STATE_MATRIX.getEnergy(a1)}`);
console.log(`Atom 2: [${STATE_MATRIX.getX(a2)}, ${STATE_MATRIX.getY(a2)}] Energy: ${STATE_MATRIX.getEnergy(a2)}`);

PULSE.initWorkers(); // ERA 44: Start the engine

async function runSimulation() {
    // Step 1: Execution (Atom 1 issues BIND intent)
    console.log(`\n--- Pulse 1: Intent Generation ---`);
    await PULSE.tick(); 
    
    // Check bond intent buffers directly (they get cleared at start of next pulse)
    console.log("Bond Request Buffer Check:", STATE_MATRIX.getBondRequest(a1));

    // Step 2: Resolution (Pulse 2 processes bond intent, physically links them)
    console.log(`\n--- Pulse 2: Bond Resolution & Metabolic Equalization ---`);
    await PULSE.tick();

    const a1Bonds = STATE_MATRIX.getBonds(a1);
    const a2Bonds = STATE_MATRIX.getBonds(a2);
    
    console.log(`Atom 1 Bond Target 0: ${a1Bonds[0]} (Stiffness: ${STATE_MATRIX.getBondStiffness(a1, 0)})`);
    console.log(`Atom 2 Bond Target 0: ${a2Bonds[0]} (Stiffness: ${STATE_MATRIX.getBondStiffness(a2, 0)})`);

    if (a1Bonds[0] === a2 && a2Bonds[0] === a1) {
         console.log("✅ SUCCESS: Symmetrical Bond Formed!");
    } else {
         console.error("❌ FAILED: Bond missing or asymmetrical.");
    }

    // Since they are bonded, Pulse 2 should have equalized their energy
    console.log(`\n--- Pulse 3: Metabolic Equalization ---`);
    await PULSE.tick();

    const e1 = STATE_MATRIX.getEnergy(a1);
    const e2 = STATE_MATRIX.getEnergy(a2);
    console.log(`Atom 1 Energy: ${e1}`);
    console.log(`Atom 2 Energy: ${e2}`);

    // Sharing should be significant, though metabolic noise (feeding/decay) might prevent perfect 0.0 diff
    if (Math.abs(e1 - e2) < 25 && e1 > 400 && e2 > 400) {
        console.log("✅ SUCCESS: Metabolic Equalization shared energy effectively!");
    } else {
        console.error("❌ FAILED: Energy did not equalize as expected.", e1, e2);
    }
    
    console.log(`\n--- Pulse 4: Physical Tensegrity (Drag) ---`);
    
    // Manually force Atom 1 to teleport away. Hooke's Law in PHYSICS_ENGINE should snap Atom 2 to it.
    STATE_MATRIX.setX(a1, 600);
    STATE_MATRIX.setY(a1, 600);
    console.log(`Atom 1 Teleported to [600, 600]`);

    for (let i = 0; i < 20; i++) await PULSE.tick(); // Give physics 20 steps to drag
    
    const ax1 = STATE_MATRIX.getX(a1);
    const ay1 = STATE_MATRIX.getY(a1);
    const ax2 = STATE_MATRIX.getX(a2);
    const ay2 = STATE_MATRIX.getY(a2);
    const dist = Math.hypot(ax1 - ax2, ay1 - ay2);

    console.log(`Atom 1 Final: [${ax1}, ${ay1}]`);
    console.log(`Atom 2 Final: [${ax2}, ${ay2}] Distance: ${dist}`);

    if (ax2 > 530 || ay2 > 510) {
        console.log("✅ SUCCESS: Tensegrity dragged Atom 2 towards Atom 1!");
    } else {
        console.error("❌ FAILED: Tensegrity failed to move Atom 2 significantly.", ax2, ay2);
    }

    console.log("\n🌀 Tensegrity Verification Complete. 🌀");
    Deno.exit(0);
}

runSimulation();
