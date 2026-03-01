// OMEGA-64 | PULSE.ts | The Autonomic Heartbeat (Era 14: The Turing Mind)
// Multi-threaded Structure-of-Arrays (SoA) simulation engine.

import { STATE_MATRIX, MAX_ATOMS } from "./STATE_MATRIX.ts";
import { RIBOSOME, ID_TO_IDX, IDX_TO_ID } from "./RIBOSOME.ts";
import { SNAPSHOT_ENGINE } from "./SNAPSHOT_ENGINE.ts";
import { SPATIAL_HASH } from "./SPATIAL_HASH.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";
import { AVATAR_ENGINE } from "./AVATAR_ENGINE.ts";
import { P2P_FEDERATION } from "./P2P_FEDERATION.ts";
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import { REFLECTION_ENGINE } from "./REFLECTION_ENGINE.ts";
import { PREDICTION_MARKET } from "./PREDICTION_MARKET.ts";
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";
import { LLM_SYNAPSE } from "./LLM_SYNAPSE.ts";
import { GATE } from "./GATE.ts";


const ROOT = Deno.cwd();
const THREAD_COUNT = 4; // Adjust based on CPU cores
const PULSE_INTERVAL = 10; // Faster pulses for high-performance era

export const PULSE = {
    workers: [] as Worker[],
    currentPulseId: 0,


    initWorkers: () => {
        for (let i = 0; i < THREAD_COUNT; i++) {
            const worker = new Worker(new URL("./PULSE_WORKER.ts", import.meta.url).href, { type: "module" });
            PULSE.workers.push(worker);
        }
        console.log(`   [PULSE] ${THREAD_COUNT} Parallel Workers initialized.`);
    },

    run: async () => {
        console.log("🛡️ OMEGA-64 | ERA 14: THE TURING MIND | PULSE ACTIVE");
        
        console.log("-> Lifting ROOT");
        const lattice = await RIBOSOME.lift(ROOT);
        console.log("-> ROOT Lifted");

        // ERA 39: If we hydrated from a snapshot, we don't want to overwrite the loaded envBuffer 
        // with a fresh seed unless this is a true cold start.
        if (!lattice.has("HYDRATED")) {
            console.log("-> Seeding Nutrients (Cold Start)");
            PHYSICS_ENGINE.seedNutrients(Date.now()); // Primary seed from bootstrap
        } else {
            console.log("-> Nutrients Hydrated (Warm Start)");
        }

        
        console.log("-> Init Workers");
        PULSE.initWorkers();
        
        while (true) {

            PULSE.currentPulseId++;
            const pulseId = PULSE.currentPulseId;


            // Main thread sequential tasks
            const activeIndices = STATE_MATRIX.getActiveIndices();
            SPATIAL_HASH.build(activeIndices);
            if (pulseId % 5 === 0) PHYSICS_ENGINE.decayPheromones();
            if (pulseId % 10 === 0) {
                // @ts-ignore: viralGrid exists in STATE_MATRIX
                PHYSICS_ENGINE.diffuseViralSemantics(STATE_MATRIX.viralGrid, pulseId);
                
                // ERA 34: Structural Decay & Memory Leaking
                // @ts-ignore: structureGrid and memoryGrid exist in STATE_MATRIX
                PHYSICS_ENGINE.decayStructures(STATE_MATRIX.structureGrid, STATE_MATRIX.memoryGrid, STATE_MATRIX.viralGrid);

                // ERA 26: Collective Immunity
                GATE.detectAntigens(STATE_MATRIX);
            }

            // ERA 27: Atomic Messaging Buffer Swap
            STATE_MATRIX.swapMessageBuffers();

            
            // Exodus Check (Throttled)
            if (pulseId % 10 === 0) {
                for (const idx of activeIndices) {
                    if (P2P_FEDERATION.checkWanderlust(idx, pulseId)) P2P_FEDERATION.migrate(idx, pulseId);
                }
            }


            // Parallel Processing via Workers
            const currentRegent = SOVEREIGNTY_ENGINE.currentRegent;
            
            const chunkSize = Math.ceil(MAX_ATOMS / THREAD_COUNT);
            const workerPromises = PULSE.workers.map((worker, i) => {
                return new Promise((resolve) => {
                    worker.onmessage = (e) => { if (e.data.done && e.data.pulseId === pulseId) resolve(null); };
                    worker.postMessage({
                        buffer: STATE_MATRIX.buffer,
                        envBuffer: PHYSICS_ENGINE.envBuffer,
                        attentionBuffer: PHYSICS_ENGINE.attentionBuffer,
                        marketBuffer: PREDICTION_MARKET.buffer,
                        startIdx: i * chunkSize,
                        endIdx: Math.min((i + 1) * chunkSize, MAX_ATOMS),
                        mods: SOVEREIGNTY_ENGINE.currentRegent.mods,
                        evolutionRequestsBuffer: STATE_MATRIX.evolutionRequestsBuffer,
                        spawnRequestsBuffer: STATE_MATRIX.spawnRequestsBuffer, // ERA 41
                        viralGridBuffer: STATE_MATRIX.viralGridBuffer,
                        immuneBuffer: STATE_MATRIX.immuneBuffer,
                        messageBufferA: STATE_MATRIX.messageBufferA,
                        messageBufferB: STATE_MATRIX.messageBufferB,
                        bondStiffnessBuffer: STATE_MATRIX.bondStiffnessBuffer,
                        synapticStackBuffer: STATE_MATRIX.synapticStackBuffer,
                        structureGridBuffer: STATE_MATRIX.structureGridBuffer,
                        memoryGridBuffer: STATE_MATRIX.memoryGridBuffer,
                        roleRegistryBuffer: STATE_MATRIX.roleRegistryBuffer,
                        semanticBonusesBuffer: STATE_MATRIX.semanticBonusesBuffer,
                        senderSignatureBufferA: STATE_MATRIX.senderSignatureBufferA,
                        senderSignatureBufferB: STATE_MATRIX.senderSignatureBufferB,
                        trustedSignatures: Array.from(GATE.trustedSignatures),
                        pulseId
                    });
                });
            });

            await Promise.all(workerPromises);

            // --- ERA 41: Epigenetic Inheritance & Heredity (Mitosis) ---
            for (const idx of activeIndices) {
                if (STATE_MATRIX.hasSpawnRequest(idx)) {
                    STATE_MATRIX.clearSpawn(idx);
                    const newIdx = STATE_MATRIX.findEmptySlot();
                    
                    if (newIdx !== -1) {
                        // 1. Division of Capital (50/50 split)
                        const parentEnergy = STATE_MATRIX.getEnergy(idx);
                        const parentResonance = STATE_MATRIX.getResonance(idx);
                        
                        const childEnergy = parentEnergy / 2;
                        const childResonance = parentResonance / 2;
                        
                        STATE_MATRIX.setEnergy(idx, childEnergy);
                        STATE_MATRIX.setResonance(idx, childResonance);
                        
                        STATE_MATRIX.setEnergy(newIdx, childEnergy);
                        STATE_MATRIX.setResonance(newIdx, childResonance);

                        // 2. Epigenetic Heredity
                        STATE_MATRIX.setLogic(newIdx, STATE_MATRIX.getLogic(idx)); // Genome
                        STATE_MATRIX.setCode(newIdx, STATE_MATRIX.getCode(idx));   // Learned Instructions
                        
                        // 3. Systemic Context
                        STATE_MATRIX.roles[newIdx] = STATE_MATRIX.roles[idx]; // Trophic Role
                        STATE_MATRIX.semanticBonuses[newIdx] = STATE_MATRIX.semanticBonuses[idx]; // Cognitive Bonus

                        // 4. Topological Placement
                        const px = STATE_MATRIX.getX(idx);
                        const py = STATE_MATRIX.getY(idx);
                        STATE_MATRIX.setX(newIdx, px + (Math.random() * 20 - 10)); // Slight offset
                        STATE_MATRIX.setY(newIdx, py + (Math.random() * 20 - 10));
                        
                        // 5. Genesis Identity
                        const childId = BigInt(`0x${STATE_MATRIX.getId(idx).toString(16).substring(0, 8)}${pulseId.toString(16).padStart(8, '0')}`);
                        STATE_MATRIX.setId(newIdx, childId);

                        console.log(`🧬 [MITOSIS] Atom ${idx} split into ${newIdx}. Inheritance successful. Child ID: ${childId.toString(16)}`);
                    }
                }
            }

            // Convergence, Crisis Resolution & Reporting
            if (pulseId % 100 === 0) {
                PREDICTION_MARKET.resolveCrisis();
                
                // Elect Regent
                const regent = SOVEREIGNTY_ENGINE.electRegent(activeIndices);
                
                // Calculate Thermodynamic Totals for monitoring
                let totalNutrients = 0;
                for (let i = 0; i < PHYSICS_ENGINE.NUTRIENTS.length; i++) {
                    totalNutrients += Atomics.load(PHYSICS_ENGINE.NUTRIENTS, i);
                }
                
                console.log(`💓 Pulse #${pulseId} | Atoms: ${activeIndices.length} | Regent: ${regent.genome} (${regent.activeDecree}) | Nutrients: ${totalNutrients}`);
            }

            // Persistence (Rapid Genesis Snapshotting every 5000 ticks ~ 1 minute)
            if (pulseId % 5000 === 0) {
                await SNAPSHOT_ENGINE.exportSnapshot();
            }

            // Crystallization & Epigenetic Evolution (RAM -> Flatland & Directed Mutation)
            if (pulseId % 1000 === 0) {
                await REFLECTION_ENGINE.crystallize(100);

                // ERA 37: Economic Dividend Distribution
                PREDICTION_MARKET.distributeDividends();

                // ERA 22: Epigenetic Mutation Processing
                // ERA 36: ORACLE PRIORITY QUEUE (Top 5% Resonance)
                const cognitiveThresholdCount = Math.ceil(activeIndices.length * 0.05);
                const cognitiveElite = activeIndices
                    .sort((a, b) => STATE_MATRIX.getResonance(b) - STATE_MATRIX.getResonance(a))
                    .slice(0, cognitiveThresholdCount);

                const winners = cognitiveElite
                    .filter(idx => STATE_MATRIX.hasEvolved(idx) && STATE_MATRIX.getResonance(idx) > 100)
                    .slice(0, 3);

                for (const idx of winners) {
                    const logicStr = Array.from(STATE_MATRIX.getLogic(idx)).map(b => b.toString(16).padStart(2, '0')).join('');
                    const currentThought = SEMANTIC_MEMBRANE.thoughtArchive.get(logicStr) || "Unknown existence.";
                    const context = `Decree: ${SOVEREIGNTY_ENGINE.currentRegent.activeDecree}, Population: ${activeIndices.length}`;
                    
                    const evolvedThought = await LLM_SYNAPSE.evolveThought(currentThought, context);
                    console.log(`🧬 [EPIGENESIS] Evolving genome [${logicStr}] -> "${evolvedThought}"`);
                    
                    SEMANTIC_MEMBRANE.project(evolvedThought, idx);
                    // Update bonuses for the new thought
                    SEMANTIC_MEMBRANE.updateSemanticBonuses(idx);
                    
                    // Record Lineage
                    const childLogic = Array.from(STATE_MATRIX.getLogic(idx)).map(b => b.toString(16).padStart(2, '0')).join('');
                    SEMANTIC_MEMBRANE.lineage.set(childLogic, logicStr);

                    STATE_MATRIX.clearEvolution(idx);
                }
            }
            await new Promise(r => setTimeout(r, PULSE_INTERVAL));
        }
    }
};

if (import.meta.main) {
    PULSE.run();
}
