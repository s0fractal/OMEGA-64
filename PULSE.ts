// OMEGA-64 | PULSE.ts | Era 68: Absolute Coherence
import { STATE_MATRIX, MAX_ATOMS, sharedBuffer } from "./STATE_MATRIX.ts";
import { SPATIAL_HASH } from "./SPATIAL_HASH.ts";
import { MATRIX_ENGINE } from "./MATRIX_ENGINE.ts";
import { SOVEREIGN_ORACLE } from "./SOVEREIGN_ORACLE.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";

const WORKER_COUNT = 4; // We can keep 4, but for the test we'll ensure index 1 is handled clearly.

const workers: Worker[] = [];
let workerPromises: Promise<any>[] = [];

export const PULSE = {
    initWorkers: async () => {
        if (workers.length > 0) return;
        
        for (let i = 0; i < WORKER_COUNT; i++) {
            const worker = new Worker(new URL("./PULSE_WORKER.ts", import.meta.url).href, { type: "module" });
            workers.push(worker);
            
            const p = new Promise((resolve) => {
                worker.onmessage = (e) => {
                    if (e.data.type === "READY") resolve(true);
                };
            });
            worker.postMessage({ 
                type: "INIT", 
                wasmMemory: STATE_MATRIX.wasmMemory,
                buffer: STATE_MATRIX.buffer 
            });
            workerPromises.push(p);
        }
        await Promise.all(workerPromises);
        console.log(`   [PULSE] ${WORKER_COUNT} Parallel Workers READY with WASM VMs.`);
    },

    tick: async () => {
        const active = STATE_MATRIX.getActiveIndices();

        // 0. Sovereign Oracle (High-Order Evolution)
        const telemetry = SOVEREIGN_ORACLE.interpretResonance();
        if (telemetry.matrixResonance > 5000) { 
            console.log(`👁️ [PULSE] Matrix Threshold Breached (${telemetry.matrixResonance}). Triggering Sovereignty Audit.`);
            const regent = SOVEREIGNTY_ENGINE.electRegent(active);
            if (regent && regent.idx !== -1) {
                console.log(`👑 [PULSE] Regent Candidate Found: ${regent.idx}. Consulting Oracle...`);
                SOVEREIGN_ORACLE.consultOracle(regent.idx, telemetry);
            } else {
                console.log("   [PULSE] No sovereign candidate found.");
            }
        }

        // 1. Resolve Sequential Logic (Bonds, Spawns)
        for (const i of active) {
            // Bond Resolution
            const bondReq = STATE_MATRIX.getBondRequest(i);
            if (bondReq) {
                const targetIdx = bondReq[1];
                if (targetIdx > 0 && targetIdx < MAX_ATOMS) {
                    // Bi-directional bond
                    STATE_MATRIX.setBondTarget(i, 0, targetIdx);
                    STATE_MATRIX.setBondStiffness(i, 0, 0.1);
                    STATE_MATRIX.setBondTarget(targetIdx, 1, i);
                    STATE_MATRIX.setBondStiffness(targetIdx, 1, 0.1);
                }
                STATE_MATRIX.clearBondRequest(i);
            }
        }

        // 2. Parallel Physics & WASM Kernel
        workerPromises = [];
        const chunkSize = Math.ceil(MAX_ATOMS / WORKER_COUNT);
        
        for (let i = 0; i < WORKER_COUNT; i++) {
            const startIdx = i * chunkSize;
            const endIdx = Math.min(MAX_ATOMS, (i + 1) * chunkSize);
            
            const p = new Promise((resolve) => {
                workers[i].onmessage = (e) => {
                    if (e.data.type === "DONE") resolve(true);
                };
            });
            workers[i].postMessage({ type: "PULSE", startIdx, endIdx, pulseId: Date.now() });
            workerPromises.push(p);
        }
        await Promise.all(workerPromises);

        // 3. Matrix Engine (Planetary Brain)
        MATRIX_ENGINE.tick();

        // 4. Rebuild Spatial Lattice
        SPATIAL_HASH.build(STATE_MATRIX.getActiveIndices());
    }
};
