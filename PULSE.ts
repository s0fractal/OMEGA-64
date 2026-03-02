// OMEGA-64 | PULSE.ts | Era 68: Absolute Coherence
import { STATE_MATRIX, MAX_ATOMS, sharedBuffer } from "./STATE_MATRIX.ts";
import * as OFFSETS from "./OFFSETS.ts";
import { SPATIAL_HASH } from "./SPATIAL_HASH.ts";
import { MATRIX_ENGINE } from "./MATRIX_ENGINE.ts";
import { SOVEREIGN_ORACLE } from "./SOVEREIGN_ORACLE.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";
import { GATE } from "./GATE.ts";

const WORKER_COUNT = 4; // We can keep 4, but for the test we'll ensure index 1 is handled clearly.

const workers: Worker[] = [];
let workerPromises: Promise<any>[] = [];

export const PULSE = {
    currentPulseId: Date.now(),
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
        const { syncState, tickCounter, SYNC } = STATE_MATRIX;
        PULSE.currentPulseId = Date.now();

        // 1. Enter WASM_TICKING State
        Atomics.store(syncState, 0, SYNC.WASM_TICKING);

        const active = STATE_MATRIX.getActiveIndices();

        // Reset Ascension Counter
        Atomics.store(new Int32Array(sharedBuffer, OFFSETS.ASCENSION_STATS_OFFSET, 1), 0, 0);

        // 0. Sovereign Oracle
        const telemetry = SOVEREIGN_ORACLE.interpretResonance();
        if (telemetry.matrixResonance > 5000) { 
            const regent = SOVEREIGNTY_ENGINE.electRegent(active);
            if (regent && regent.idx !== -1) {
                SOVEREIGN_ORACLE.consultOracle(regent.idx, telemetry);
            }
        }

        // 1. Resolve Sequential Logic
        for (const i of active) {
            const bondReq = STATE_MATRIX.getBondRequest(i);
            if (bondReq) {
                const targetIdx = bondReq[1];
                if (targetIdx > 0 && targetIdx < MAX_ATOMS) {
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

        // 3. Matrix Engine
        const matrixDone = new Promise<void>((resolve) => {
            workers[0].onmessage = (e) => {
                if (e.data.type === "MATRIX_DONE") resolve();
            };
        });
        workers[0].postMessage({ type: "TICK_MATRIX", pulseId: Date.now() });
        await matrixDone;

        // --- TRANSITION TO HOST_LOCK ---
        // Matrix is now settled, workers are done. Lock for host-side logic & SNAPSHOTS.
        Atomics.store(syncState, 0, SYNC.HOST_LOCK);

        // 4. Drain Spawn Queue
        {
            const headView  = new Int32Array(sharedBuffer, OFFSETS.SPAWN_REQUESTS_OFFSET, 2);
            const readHead  = Atomics.load(headView, 1);
            const writeHead = Atomics.load(headView, 0);

            let spawned = 0;
            let cursor = readHead;

            while (cursor !== writeHead % 1024 && spawned < 64) {
                const slotOff = OFFSETS.SPAWN_REQUESTS_OFFSET + 8 + cursor * 16;
                const genomeLo = new Uint32Array(sharedBuffer, slotOff, 1)[0];

                if (genomeLo !== 0) {
                    const genomeHi = new Uint32Array(sharedBuffer, slotOff + 4, 1)[0];
                    const cx = new Int16Array(sharedBuffer, slotOff + 8, 1)[0];
                    const cy = new Int16Array(sharedBuffer, slotOff + 10, 1)[0];
                    const childEnergy = new Int32Array(sharedBuffer, slotOff + 12, 1)[0];

                    const freeIdx = STATE_MATRIX.findFreeSlot();

                    if (freeIdx >= 0 && freeIdx < MAX_ATOMS) {
                        const childId = BigInt(Date.now()) ^ BigInt(freeIdx);
                        const genome = new Uint8Array(8);
                        new Uint32Array(genome.buffer)[0] = genomeLo;
                        new Uint32Array(genome.buffer)[1] = genomeHi;
                        
                        // Seed atom with standard biological script and genome
                        STATE_MATRIX.seedAtom(freeIdx, childId, cx * 10 + 5, cy * 10 + 5, Math.max(childEnergy, 500) / STATE_MATRIX.SCALE, 0, genome);
                        spawned++;
                    }
                    new Uint32Array(sharedBuffer, slotOff, 1)[0] = 0;
                }
                cursor = (cursor + 1) % 1024;
            }
            Atomics.store(headView, 1, cursor);
            if (spawned > 0) console.log(`🌱 [PULSE] Spawned ${spawned} atoms with RISC boot scripts.`);
        }

        // 5. Rebuild Spatial Lattice
        SPATIAL_HASH.build(STATE_MATRIX.getActiveIndices());

        // 6. Autonomous Systemic Audit (Every 5 ticks)
        const currentTick = Atomics.load(tickCounter, 0);
        if (currentTick % 5 === 0) {
            GATE.auditMatrix(STATE_MATRIX);
        }

        // Increment Global Tick Counter
        Atomics.add(tickCounter, 0, 1);

        // 6. Return to IDLE
        Atomics.store(syncState, 0, SYNC.IDLE);
    }
};
