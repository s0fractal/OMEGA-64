// OMEGA-64 | PULSE.ts | Era 68: Absolute Coherence
import { STATE_MATRIX, MAX_ATOMS, sharedBuffer } from "./STATE_MATRIX.ts";
import * as OFFSETS from "./OFFSETS.ts";
import { SOVEREIGN_ORACLE } from "./SOVEREIGN_ORACLE.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";
import { GATE } from "./GATE.ts";

// Multi-instance AssemblyScript + shared memory can corrupt lattice state
// because each instance owns an independent stack global over the same buffer.
// Keep env override for diagnostics and rollout tuning.
const parseWorkerCount = (): number => {
    const raw = Deno.env.get("OMEGA_PULSE_WORKERS");
    if (!raw) return 4;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1) return 4;
    return Math.min(32, n);
};
const parseStrictDeterminism = (): boolean => {
    const raw = Deno.env.get("OMEGA_STRICT_DETERMINISM");
    return raw === "1" || raw === "true" || raw === "TRUE";
};
const WORKER_COUNT = parseWorkerCount();
const STRICT_DETERMINISM = parseStrictDeterminism();
const WORKER_RESPONSE_TIMEOUT_MS = 30_000;
const SPAWN_RING_CAPACITY = 1024;
const SPAWN_SLOT_BYTES = 16;

const workers: Worker[] = [];
let workerPromises: Promise<any>[] = [];

const idsView = new BigUint64Array(sharedBuffer, OFFSETS.IDS_OFFSET, MAX_ATOMS);
const xsView = new Int16Array(sharedBuffer, OFFSETS.XS_OFFSET, MAX_ATOMS);
const ysView = new Int16Array(sharedBuffer, OFFSETS.YS_OFFSET, MAX_ATOMS);
const energiesView = new Int32Array(sharedBuffer, OFFSETS.ENERGY_OFFSET, MAX_ATOMS);
const resonancesView = new Int32Array(sharedBuffer, OFFSETS.RESONANCE_OFFSET, MAX_ATOMS);
const readXsView = new Int16Array(sharedBuffer, OFFSETS.PHYSICS_READ_XS_OFFSET, MAX_ATOMS);
const readYsView = new Int16Array(sharedBuffer, OFFSETS.PHYSICS_READ_YS_OFFSET, MAX_ATOMS);
const readEnergiesView = new Int32Array(sharedBuffer, OFFSETS.PHYSICS_READ_ENERGY_OFFSET, MAX_ATOMS);
const readResonancesView = new Int32Array(sharedBuffer, OFFSETS.PHYSICS_READ_RESONANCE_OFFSET, MAX_ATOMS);
const spawnHeadView = new Int32Array(sharedBuffer, OFFSETS.SPAWN_REQUESTS_OFFSET, 2);
const spawnDataView = new DataView(
    sharedBuffer,
    OFFSETS.SPAWN_REQUESTS_OFFSET + 8,
    SPAWN_RING_CAPACITY * SPAWN_SLOT_BYTES,
);
const coherenceView = new Int32Array(sharedBuffer, OFFSETS.COHERENCE_OFFSET, 1);

const nextPulseId = (): number => Date.now() + Math.floor(Math.random() * 1_000_000);
const findNextFreeSlot = (startIdx: number): number => {
    for (let i = startIdx; i < MAX_ATOMS; i++) {
        if (Atomics.load(idsView, i) === 0n) return i;
    }
    return -1;
};

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

const dispatchRangePhase = async (type: "PULSE" | "REDUCE_DELTAS", doneType: "DONE" | "DELTA_DONE"): Promise<void> => {
    workerPromises = [];
    if (STRICT_DETERMINISM && WORKER_COUNT > 1) {
        const pulseId = nextPulseId();
        workerPromises.push(postAndWait(
            workers[0],
            { type, startIdx: 0, endIdx: MAX_ATOMS, pulseId },
            doneType,
        ));
    } else {
        const chunkSize = Math.ceil(MAX_ATOMS / WORKER_COUNT);
        for (let i = 0; i < WORKER_COUNT; i++) {
            const startIdx = i * chunkSize;
            const endIdx = Math.min(MAX_ATOMS, (i + 1) * chunkSize);

            const pulseId = nextPulseId();
            workerPromises.push(postAndWait(
                workers[i],
                { type, startIdx, endIdx, pulseId },
                doneType,
            ));
        }
    }
    await Promise.all(workerPromises);
};

export const PULSE = {
    currentPulseId: Date.now(),
    initWorkers: async () => {
        if (workers.length > 0) return;
        if (Deno.env.get("OMEGA_PULSE_WORKERS")) {
            console.log(`   [PULSE] Worker override: OMEGA_PULSE_WORKERS=${WORKER_COUNT}`);
        }
        if (STRICT_DETERMINISM && WORKER_COUNT > 1) {
            console.log("   [PULSE] OMEGA_STRICT_DETERMINISM=1 -> serial execute on worker-0.");
        }
        
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
        try {
            // 0. Sovereign Oracle Peak Detection & Coherence Polling
            const currentTick = Atomics.load(tickCounter, 0);
            const activeIdx = STATE_MATRIX.getActiveIndices();
            
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
                const regent = SOVEREIGNTY_ENGINE.electRegent(activeIdx);
                if (regent && regent.idx !== -1) {
                    SOVEREIGN_ORACLE.consultOracle(regent.idx, telemetry);
                }
            }

            // 1. Resolve Sequential Logic
            for (const i of activeIdx) {
                if (STATE_MATRIX.hasBondRequest(i)) {
                    const targetIdx = STATE_MATRIX.getBondRequestTarget(i);
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

            // 2a.1 Freeze position snapshot for deterministic physics reads across workers.
            {
                readXsView.set(xsView);
                readYsView.set(ysView);
                readEnergiesView.set(energiesView);
                readResonancesView.set(resonancesView);
            }
            // 2b. Execute Physics (WASM)
            // Transition to WASM_TICKING (1) to unblock workers
            Atomics.store(syncState, 0, SYNC.WASM_TICKING);
            Atomics.notify(syncState, 0);
            await dispatchRangePhase("PULSE", "DONE");

            // 2c. Reduce cross-atom deltas inside WASM over deterministic index ranges.
            await dispatchRangePhase("REDUCE_DELTAS", "DELTA_DONE");

            // 3. Matrix Engine (WASM)
            const matrixPulseId = nextPulseId();
            await postAndWait(workers[0], { type: "TICK_MATRIX", pulseId: matrixPulseId }, "MATRIX_DONE");

            // --- TRANSITION TO HOST_LOCK ---
            // Matrix is now settled, workers are done. Lock for host-side logic & SNAPSHOTS.
            Atomics.store(syncState, 0, SYNC.HOST_LOCK);
            Atomics.notify(syncState, 0);

            // 4. Drain Spawn Queue
            {
                const readHead = Atomics.load(spawnHeadView, 1);
                const writeHead = Atomics.load(spawnHeadView, 0);
                const writeCursor = writeHead % SPAWN_RING_CAPACITY;

                let spawned = 0;
                let cursor = readHead;
                let freeSearchCursor = 0;
                let freeSlotsExhausted = false;
                const genome = new Uint8Array(8);
                const genomeWords = new Uint32Array(genome.buffer);

                while (cursor !== writeCursor && spawned < 64) {
                    const slotOff = cursor * SPAWN_SLOT_BYTES;
                    const genomeLo = spawnDataView.getUint32(slotOff, true);

                    if (genomeLo !== 0) {
                        const genomeHi = spawnDataView.getUint32(slotOff + 4, true);
                        const cx = spawnDataView.getInt16(slotOff + 8, true);
                        const cy = spawnDataView.getInt16(slotOff + 10, true);
                        const childEnergy = spawnDataView.getInt32(slotOff + 12, true);

                        let freeIdx = -1;
                        if (!freeSlotsExhausted) {
                            freeIdx = findNextFreeSlot(freeSearchCursor);
                            if (freeIdx >= 0) {
                                freeSearchCursor = freeIdx + 1;
                            } else {
                                freeSlotsExhausted = true;
                            }
                        }

                        if (freeIdx >= 0 && freeIdx < MAX_ATOMS) {
                            const childId = BigInt(Date.now()) ^ BigInt(freeIdx);
                            genomeWords[0] = genomeLo;
                            genomeWords[1] = genomeHi;
                            
                            // Seed atom with standard biological script and genome
                            STATE_MATRIX.seedAtom(freeIdx, childId, cx * 10 + 5, cy * 10 + 5, Math.max(childEnergy, 500) / STATE_MATRIX.SCALE, 0, genome);
                            activeIdx.push(freeIdx);
                            spawned++;
                        }
                        spawnDataView.setUint32(slotOff, 0, true);
                    }
                    cursor = (cursor + 1) % SPAWN_RING_CAPACITY;
                }
                Atomics.store(spawnHeadView, 1, cursor);
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
                let totalResonance = 0;
                for (const idx of activeIdx) {
                    totalResonance += resonancesView[idx];
                }
                // Average Resonance normalized to 0-255 (Absolute Coherence)
                const avgRes = activeIdx.length > 0 ? (totalResonance / activeIdx.length) : 0;
                const coherence = Math.min(255, Math.floor(avgRes / 100));
                
                // Write to Unified Lattice
                Atomics.store(coherenceView, 0, coherence);
                
                if (currentTick % 20 === 0) {
                    console.log(`💎 [RESONANCE] System Coherence: ${coherence}/255 (Avg Res: ${(avgRes/100).toFixed(1)})`);
                }
            }

            // Increment Global Tick Counter
            Atomics.add(tickCounter, 0, 1);
        } finally {
            Atomics.store(syncState, 0, SYNC.IDLE);
            Atomics.notify(syncState, 0);
        }
    }
};
