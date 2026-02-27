// OMEGA-64 | PULSE.ts | The Autonomic Heartbeat (Era 14: The Turing Mind)
// Multi-threaded Structure-of-Arrays (SoA) simulation engine.

import { STATE_MATRIX, MAX_ATOMS, GOD_ATOM_INDEX } from "./STATE_MATRIX.ts";
import { RIBOSOME, ID_TO_IDX, IDX_TO_ID } from "./RIBOSOME.ts";
import { SNAP } from "./SNAP.ts";
import { SPATIAL_HASH } from "./SPATIAL_HASH.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";
import { AVATAR_ENGINE } from "./AVATAR_ENGINE.ts";
import { TIMELINE_FORK } from "./TIMELINE_FORK.ts";
import { P2P_FEDERATION } from "./P2P_FEDERATION.ts";
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";

const ROOT = Deno.cwd();
const THREAD_COUNT = 4; // Adjust based on CPU cores
const PULSE_INTERVAL = 10; // Faster pulses for high-performance era

export const PULSE = {
    workers: [] as Worker[],

    initWorkers: () => {
        for (let i = 0; i < THREAD_COUNT; i++) {
            const worker = new Worker(new URL("./PULSE_WORKER.ts", import.meta.url).href, { type: "module" });
            PULSE.workers.push(worker);
        }
        console.log(`   [PULSE] ${THREAD_COUNT} Parallel Workers initialized.`);
    },

    run: async () => {
        console.log("🛡️ OMEGA-64 | ERA 14: THE TURING MIND | PULSE ACTIVE");
        
        await RIBOSOME.lift(ROOT);
        TIMELINE_FORK.init();
        PULSE.initWorkers();
        
        let pulseCount = 0;

        while (true) {
            pulseCount++;
            const timelines = Array.from(TIMELINE_FORK.timelines.values());
            
            for (const timeline of timelines) {
                // Main thread sequential tasks
                if (timeline.id === "ALPHA") {
                    const activeIndices = PULSE.getTimelineActiveIndices(timeline.buffer);
                    SPATIAL_HASH.build(activeIndices);
                    PHYSICS_ENGINE.decayPheromones();
                    AVATAR_ENGINE.applyInfluence();
                    
                    // Exodus Check (Throttled)
                    if (pulseCount % 10 === 0) {
                        for (const idx of activeIndices) {
                            if (P2P_FEDERATION.checkWanderlust(idx)) P2P_FEDERATION.migrate(idx);
                        }
                    }
                }

                // Parallel Processing via Workers
                const chunkSize = Math.ceil(MAX_ATOMS / THREAD_COUNT);
                const workerPromises = PULSE.workers.map((worker, i) => {
                    return new Promise((resolve) => {
                        worker.onmessage = (e) => { if (e.data.done) resolve(null); };
                        worker.postMessage({
                            buffer: timeline.buffer,
                            startIdx: i * chunkSize,
                            endIdx: Math.min((i + 1) * chunkSize, MAX_ATOMS),
                            mods: { speed: 1.0, decay: 1.0 },
                            tick: Date.now() + pulseCount
                        });
                    });
                });

                await Promise.all(workerPromises);
            }

            // Convergence & Reporting
            if (pulseCount % 100 === 0) {
                if (timelines.length > 1) TIMELINE_FORK.collapse();
                console.log(`💓 Pulse #${pulseCount} | Realities: ${timelines.length} | Atoms: ${PULSE.getTimelineActiveIndices(timelines[0].buffer).length}`);
                
                // Persistence (Alpha only)
                await SNAP.save(ROOT);
            }

            await new Promise(r => setTimeout(r, PULSE_INTERVAL));
        }
    },

    getTimelineActiveIndices: (buffer: SharedArrayBuffer) => {
        const ids = new BigUint64Array(buffer, 0, MAX_ATOMS);
        const active: number[] = [];
        for (let i = 0; i < MAX_ATOMS; i++) {
            if (ids[i] !== 0n) active.push(i);
        }
        return active;
    }
};

if (import.meta.main) {
    PULSE.run();
}
