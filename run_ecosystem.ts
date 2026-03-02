// OMEGA-64 | run_ecosystem.ts | Long-term Evolution Simulator

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PULSE } from "./PULSE.ts";
import { ISA } from "./LAMBDA_VM.ts";

const TOTAL_TICKS = 50000;
const LOG_INTERVAL = 100;
const SEED_COUNT = 100;

function seedEcosystem() {
    STATE_MATRIX.clear();
    console.log("🌱 Seeding Ecosystem with Primordial Cells...");

    // Basic Producer Logic
    // EAT (10) -> CROSS_REP (bond slot 0) -> PHASE_LIFE -> SELF_REP -> JMP 0
    const producerLogic = new Uint8Array([0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11]);
    const producerCode = new Uint32Array(16);
    producerCode[0] = (20 << 8) | ISA.EAT;
    producerCode[1] = ISA.CROSS_REP;
    producerCode[2] = ISA.PHASE_LIFE;
    producerCode[3] = ISA.SELF_REP;
    producerCode[4] = ISA.JMP;

    // Advanced Seeder (attempts Phi packing and Ascension if successful)
    const ascenderLogic = new Uint8Array([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]);
    const ascenderCode = new Uint32Array(16);
    ascenderCode[0] = (25 << 8) | ISA.EAT;     // Eat 25
    ascenderCode[1] = ISA.PHASE_LIFE;          // Ageing & Apoptosis
    ascenderCode[2] = ISA.PHI;                 // Shift Phase by Golden Angle
    ascenderCode[3] = (10 << 8) | ISA.SHARE;   // Altruism
    ascenderCode[4] = ISA.ASCEND;              // Attempt Ascension
    ascenderCode[5] = ISA.SELF_REP;            // Reproduce
    ascenderCode[6] = ISA.JMP;                 // Loop

    // Atoms no longer rely on nutrients, they are given infinite initial energy.
    for (let i = 0; i < SEED_COUNT; i++) {
        const idx = STATE_MATRIX.findEmptySlot();
        if (idx === -1) break;
        
        STATE_MATRIX.setId(idx, BigInt(i + 1));
        // Random placement across the 1400x800 map
        STATE_MATRIX.setX(idx, Math.floor(Math.random() * 1400));
        STATE_MATRIX.setY(idx, Math.floor(Math.random() * 800));
        STATE_MATRIX.setEnergy(idx, 100000 + Math.random() * 20000); // Massive energy for endless execution
        STATE_MATRIX.setResonance(idx, 100);
        
        if (i < SEED_COUNT * 0.8) {
            STATE_MATRIX.setLogic(idx, producerLogic);
            STATE_MATRIX.setCode(idx, producerCode);
        } else {
            STATE_MATRIX.setLogic(idx, ascenderLogic);
            STATE_MATRIX.setCode(idx, ascenderCode);
        }
    }
}

async function run() {
    console.log(`🌌 Starting OMEGA-64 Continuous Evolution for ${TOTAL_TICKS} Ticks...`);
    seedEcosystem();
    PULSE.initWorkers();

    let maxPopulation = 0;
    let totalAscensions = 0;

    const startTime = Date.now();

    for (let tick = 1; tick <= TOTAL_TICKS; tick++) {
        await PULSE.tick();

        if (tick % LOG_INTERVAL === 0) {
            const active = STATE_MATRIX.getActiveIndices();
            const pop = active.length;
            if (pop > maxPopulation) maxPopulation = pop;

            let totalEnergy = 0;
            let totalResonance = 0;
            let oldest = 0;

            for (const idx of active) {
                totalEnergy += STATE_MATRIX.getEnergy(idx);
                totalResonance += STATE_MATRIX.getResonance(idx);
                const age = tick - (STATE_MATRIX.birthTicks ? Atomics.load(STATE_MATRIX.birthTicks as unknown as Int32Array, idx) : tick);
                if (age > oldest && age < tick) oldest = age;
            }

            // Count ascensions by looking at the structure grid
            let currentCrystals = 0;
            for (let i = 0; i < 140 * 80; i++) {
                const cell = Atomics.load(STATE_MATRIX.structureGrid, i);
                if ((cell & 0xFF) === 1 && ((cell >> 8) & 0xFF) === 255) {
                    currentCrystals++;
                }
            }
            totalAscensions = currentCrystals;

            const avgE = pop > 0 ? (totalEnergy / pop).toFixed(0) : "0";
            const avgR = pop > 0 ? (totalResonance / pop).toFixed(0) : "0";

            console.log(`[Pulse ${tick.toString().padStart(6, ' ')}] Pop: ${pop.toString().padStart(5, ' ')} | Avg E: ${avgE.padStart(5, ' ')} | Avg R: ${avgR.padStart(5, ' ')} | Oldest: ${oldest} | Crystals (Ascended): ${currentCrystals}`);

            if (pop === 0) {
                console.log("💀 Ecosystem collapse. All atoms died.");
                break;
            }
        }
    }

    const elapsed = Date.now() - startTime;
    console.log(`\n✅ Simulation Ended in ${(elapsed / 1000).toFixed(2)}s.`);
    console.log(`Max Population: ${maxPopulation}`);
    console.log(`Matrixland Ascensions (Crystals): ${totalAscensions}`);
    PULSE.stopWorkers();
    Deno.exit(0);
}

run();
