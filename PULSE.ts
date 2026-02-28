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
        await RIBOSOME.lift(ROOT);
        console.log("-> ROOT Lifted");

        console.log("-> Seeding Nutrients");
        PHYSICS_ENGINE.seedNutrients(Date.now()); // Primary seed from bootstrap

        
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
            }

            
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
                        viralGridBuffer: STATE_MATRIX.viralGridBuffer,
                        pulseId
                    });
                });
            });

            await Promise.all(workerPromises);

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

                // ERA 22: Epigenetic Mutation Processing
                const winners = activeIndices
                    .filter(idx => STATE_MATRIX.hasEvolved(idx) && STATE_MATRIX.getResonance(idx) > 100)
                    .sort((a, b) => STATE_MATRIX.getResonance(b) - STATE_MATRIX.getResonance(a))
                    .slice(0, 3);

                for (const idx of winners) {
                    const logicStr = Array.from(STATE_MATRIX.getLogic(idx)).map(b => b.toString(16).padStart(2, '0')).join('');
                    const currentThought = SEMANTIC_MEMBRANE.thoughtArchive.get(logicStr) || "Unknown existence.";
                    const context = `Decree: ${SOVEREIGNTY_ENGINE.currentRegent.activeDecree}, Population: ${activeIndices.length}`;
                    
                    const evolvedThought = await LLM_SYNAPSE.evolveThought(currentThought, context);
                    console.log(`🧬 [EPIGENESIS] Evolving genome [${logicStr}] -> "${evolvedThought}"`);
                    
                    SEMANTIC_MEMBRANE.project(evolvedThought, idx);
                    
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
