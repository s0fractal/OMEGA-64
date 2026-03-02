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

        // Reset Ascension Counter (32-bit int at offset)
        // Offset Calculation: SAFETY_BUFFER (1M) + ASC_OFF (34M) = 35M
        Atomics.store(new Int32Array(sharedBuffer, 35000000, 1), 0, 0);

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

        // 3. Matrix Engine (Planetary Brain — WASM-Accelerated via worker[0])
        // Only one worker needs to run tick_matrix since it operates on shared memory
        const matrixDone = new Promise<void>((resolve) => {
            workers[0].onmessage = (e) => {
                if (e.data.type === "MATRIX_DONE") resolve();
            };
        });
        workers[0].postMessage({ type: "TICK_MATRIX", pulseId: Date.now() });
        await matrixDone;

        // 4. Phase 20: Drain Spawn Queue — materialize child atoms
        //    SPAWN_GRID ring-buffer: head at byte 37MB+1MB, data after +8 bytes
        //    Each slot = 16 bytes: u64 genome | i16 cx | i16 cy | i32 energy
        {
            const SPAWN_BASE   = 1000000 + 37000000; // SAFETY_BUFFER + 37MB
            const SPAWN_HEAD_OFF = SPAWN_BASE;
            const SPAWN_DATA_OFF = SPAWN_BASE + 8;
            const SPAWN_MAX    = 1024;
            const SPAWN_SLOT   = 16;

            const headView  = new Int32Array(sharedBuffer, SPAWN_HEAD_OFF, 2);
            const readHead  = Atomics.load(headView, 1);   // [1] = read cursor
            const writeHead = Atomics.load(headView, 0);   // [0] = write cursor

            let spawned = 0;
            let cursor = readHead;

            while (cursor !== writeHead % SPAWN_MAX && spawned < 64) {
                const slotOff = SPAWN_DATA_OFF + cursor * SPAWN_SLOT;
                const genomeLo = new Uint32Array(sharedBuffer, slotOff, 1)[0];

                // Only process non-empty slots (genomeLo ≠ 0)
                if (genomeLo !== 0) {
                    const genomeHi = new Uint32Array(sharedBuffer, slotOff + 4, 1)[0];
                    const cx = new Int16Array(sharedBuffer, slotOff + 8, 1)[0];
                    const cy = new Int16Array(sharedBuffer, slotOff + 10, 1)[0];
                    const childEnergy = new Int32Array(sharedBuffer, slotOff + 12, 1)[0];

                    // Find first free atom slot
                    const freeIdx = STATE_MATRIX.getActiveIndices().length < MAX_ATOMS
                        ? STATE_MATRIX.findFreeSlot()
                        : -1;

                    if (freeIdx >= 0 && freeIdx < MAX_ATOMS) {
                        const childId = BigInt(Date.now()) ^ BigInt(freeIdx);
                        STATE_MATRIX.setId(freeIdx, childId);
                        STATE_MATRIX.setX(freeIdx, cx * 10 + 5);
                        STATE_MATRIX.setY(freeIdx, cy * 10 + 5);
                        STATE_MATRIX.setEnergy(freeIdx, Math.max(childEnergy, 500));
                        STATE_MATRIX.setResonance(freeIdx, 50);
                        STATE_MATRIX.setPhase(freeIdx, 0);
                        // Reconstruct genome from lo+hi u32
                        const genome = new Uint8Array(8);
                        new Uint32Array(genome.buffer)[0] = genomeLo;
                        new Uint32Array(genome.buffer)[1] = genomeHi;
                        STATE_MATRIX.setLogic(freeIdx, genome);
                        spawned++;
                    }

                    // Clear the slot
                    new Uint32Array(sharedBuffer, slotOff, 1)[0] = 0;
                }

                cursor = (cursor + 1) % SPAWN_MAX;
            }

            // Advance read cursor
            Atomics.store(headView, 1, cursor);

            if (spawned > 0) {
                console.log(`🌱 [PULSE] Spawned ${spawned} child atoms from REPLICATE queue!`);
            }
        }

        // 5. Rebuild Spatial Lattice
        SPATIAL_HASH.build(STATE_MATRIX.getActiveIndices());
    }
};
