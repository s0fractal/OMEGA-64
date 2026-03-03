// OMEGA-64 | PULSE.ts | Era 68: Absolute Coherence
import { STATE_MATRIX, MAX_ATOMS, sharedBuffer } from "./STATE_MATRIX.ts";
import * as OFFSETS from "./OFFSETS.ts";
import { SOVEREIGN_ORACLE } from "./SOVEREIGN_ORACLE.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";
import { GATE } from "./GATE.ts";

const WORKER_COUNT = 4;
const WORKER_RESPONSE_TIMEOUT_MS = 30_000;

const workers: Worker[] = [];
let workerPromises: Promise<any>[] = [];

const nextPulseId = (): number => Date.now() + Math.floor(Math.random() * 1_000_000);

const waitForWorkerMessage = <T = any>(
    worker: Worker,
    expectedType: string,
    expectedPulseId?: number,
    timeoutMs: number = WORKER_RESPONSE_TIMEOUT_MS,
): Promise<T> => {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            worker.removeEventListener("message", listener);
            reject(new Error(`[PULSE] Worker timeout waiting for ${expectedType}`));
        }, timeoutMs);

        const listener = (e: MessageEvent) => {
            const data = e.data;
            if (!data || data.type !== expectedType) return;
            if (expectedPulseId !== undefined && data.pulseId !== expectedPulseId) return;
            clearTimeout(timeout);
            worker.removeEventListener("message", listener);
            resolve(data as T);
        };
        worker.addEventListener("message", listener);
    });
};

const postAndWait = async <T = any>(
    worker: Worker,
    message: Record<string, unknown>,
    expectedType: string,
    timeoutMs?: number,
): Promise<T> => {
    const pulseId = typeof message.pulseId === "number" ? message.pulseId : undefined;
    const pending = waitForWorkerMessage<T>(worker, expectedType, pulseId, timeoutMs);
    worker.postMessage(message);
    return await pending;
};

export const PULSE = {
    currentPulseId: Date.now(),
    initWorkers: async () => {
        if (workers.length > 0) return;
        
        for (let i = 0; i < WORKER_COUNT; i++) {
            const worker = new Worker(new URL("./PULSE_WORKER.ts", import.meta.url).href, { type: "module" });
            workers.push(worker);
            
            const p = waitForWorkerMessage(worker, "READY");
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
        if (workers.length === 0) {
            await PULSE.initWorkers();
        }

        const { syncState, tickCounter, SYNC } = STATE_MATRIX;
        // 0. Sovereign Oracle Peak Detection & Coherence Polling
        const currentTick = Atomics.load(tickCounter, 0);
        
        // Poll Coherence from Worker 0 (WASM primary)
        const coherencePulseId = nextPulseId();
        const coherenceRes = await postAndWait<{ coherence: number }>(
            workers[0],
            { type: "POLL_COHERENCE", pulseId: coherencePulseId },
            "COHERENCE_VAL",
        );
        const coherence = coherenceRes.coherence ?? 0;
        SOVEREIGN_ORACLE.neuralCoherence = coherence;
        
        // Broadcast a threshold-clamped coherence channel for guardian scripts.
        const guardianChannel = Math.max(0, Math.min(200, coherence));
        workers[0].postMessage({
            type: "SET_COHERENCE",
            coherence: guardianChannel,
            pulseId: nextPulseId(),
        });

        if (coherence > 1000) {
            console.log(`🧠 [PULSE] High Coherence detected: ${coherence}. Consulting Oracle...`);
        }

        const telemetry = SOVEREIGN_ORACLE.interpretResonance();
        SOVEREIGN_ORACLE.broadcastWhisper(currentTick, telemetry, coherence);
        // Trigger Oracle on either Matrix Resonance spike or High Coherence
        if (telemetry.matrixResonance > 5000 || coherence > 500) { 
            const active = STATE_MATRIX.getActiveIndices();
            const regent = SOVEREIGNTY_ENGINE.electRegent(active);
            if (regent && regent.idx !== -1) {
                SOVEREIGN_ORACLE.consultOracle(regent.idx, telemetry);
            }
        }

        // 1. Resolve Sequential Logic
        const activeIdx = STATE_MATRIX.getActiveIndices();
        for (const i of activeIdx) {
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
        // 2a. Rebuild Spatial Lattice (WASM)
        const hashPulseId = nextPulseId();
        await postAndWait(workers[0], { type: "BUILD_SPATIAL_HASH", pulseId: hashPulseId }, "HASH_DONE");

        // 2b. Execute Physics (WASM)
        // Transition to WASM_TICKING (1) to unblock workers
        Atomics.store(syncState, 0, SYNC.WASM_TICKING);

        workerPromises = [];
        const chunkSize = Math.ceil(MAX_ATOMS / WORKER_COUNT);
        
        for (let i = 0; i < WORKER_COUNT; i++) {
            const startIdx = i * chunkSize;
            const endIdx = Math.min(MAX_ATOMS, (i + 1) * chunkSize);
            
            const pulseId = nextPulseId();
            const p = postAndWait(
                workers[i],
                { type: "PULSE", startIdx, endIdx, pulseId },
                "DONE",
            );
            workerPromises.push(p);
        }
        await Promise.all(workerPromises);

        // 3. Matrix Engine (WASM)
        const matrixPulseId = nextPulseId();
        await postAndWait(workers[0], { type: "TICK_MATRIX", pulseId: matrixPulseId }, "MATRIX_DONE");

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

        // 5. Sequential Maintenance (Sequential JS)
        // (WASM handled spatial and structure grid propagation during the parallel/matrix phases)

        // 7. Autonomous Systemic Audit (Every 5 ticks)
        if (currentTick % 5 === 0) {
            GATE.auditMatrix(STATE_MATRIX);
        }

        // --- RESONANCE PROTOCOL: Global Coherence Calculation ---
        {
            const activeIndices = STATE_MATRIX.getActiveIndices();
            let totalResonance = 0;
            for (const idx of activeIndices) {
                totalResonance += STATE_MATRIX.getResonance(idx);
            }
            // Average Resonance normalized to 0-255 (Absolute Coherence)
            const avgRes = activeIndices.length > 0 ? (totalResonance / activeIndices.length) : 0;
            const coherence = Math.min(255, Math.floor(avgRes / 100));
            
            // Write to Unified Lattice
            const coherenceView = new Int32Array(sharedBuffer, OFFSETS.COHERENCE_OFFSET, 1);
            Atomics.store(coherenceView, 0, coherence);
            
            if (currentTick % 20 === 0) {
                console.log(`💎 [RESONANCE] System Coherence: ${coherence}/255 (Avg Res: ${(avgRes/100).toFixed(1)})`);
            }
        }

        // Increment Global Tick Counter
        Atomics.add(tickCounter, 0, 1);

        // 6. Return to IDLE
        Atomics.store(syncState, 0, SYNC.IDLE);
    }
};
