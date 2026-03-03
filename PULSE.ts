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
const GRID_W = 140;
const GRID_H = 80;
const GRID_CELLS = GRID_W * GRID_H;

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

            // 2a.1 Freeze position snapshot for deterministic physics reads across workers.
            {
                const xs = new Int16Array(sharedBuffer, OFFSETS.XS_OFFSET, MAX_ATOMS);
                const ys = new Int16Array(sharedBuffer, OFFSETS.YS_OFFSET, MAX_ATOMS);
                const energies = new Int32Array(sharedBuffer, OFFSETS.ENERGY_OFFSET, MAX_ATOMS);
                const resonances = new Int32Array(sharedBuffer, OFFSETS.RESONANCE_OFFSET, MAX_ATOMS);
                const readXs = new Int16Array(sharedBuffer, OFFSETS.PHYSICS_READ_XS_OFFSET, MAX_ATOMS);
                const readYs = new Int16Array(sharedBuffer, OFFSETS.PHYSICS_READ_YS_OFFSET, MAX_ATOMS);
                const readEnergies = new Int32Array(sharedBuffer, OFFSETS.PHYSICS_READ_ENERGY_OFFSET, MAX_ATOMS);
                const readResonances = new Int32Array(sharedBuffer, OFFSETS.PHYSICS_READ_RESONANCE_OFFSET, MAX_ATOMS);
                readXs.set(xs);
                readYs.set(ys);
                readEnergies.set(energies);
                readResonances.set(resonances);
            }
            // 2a.2 Clear structure intent buffers before parallel execute phase.
            {
                const buildOwners = new Int32Array(sharedBuffer, OFFSETS.STRUCTURE_BUILD_OWNER_OFFSET, GRID_CELLS);
                const buildValues = new Int32Array(sharedBuffer, OFFSETS.STRUCTURE_BUILD_VALUE_OFFSET, GRID_CELLS);
                const chargeIntents = new Int32Array(sharedBuffer, OFFSETS.STRUCTURE_CHARGE_INTENT_OFFSET, GRID_CELLS);
                buildOwners.fill(0);
                buildValues.fill(0);
                chargeIntents.fill(0);
            }

            // 2b. Execute Physics (WASM)
            // Transition to WASM_TICKING (1) to unblock workers
            Atomics.store(syncState, 0, SYNC.WASM_TICKING);
            Atomics.notify(syncState, 0);

            workerPromises = [];
            if (STRICT_DETERMINISM && WORKER_COUNT > 1) {
                const pulseId = nextPulseId();
                workerPromises.push(postAndWait(
                    workers[0],
                    { type: "PULSE", startIdx: 0, endIdx: MAX_ATOMS, pulseId },
                    "DONE",
                ));
            } else {
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
            }
            await Promise.all(workerPromises);

            // 2c. Deterministic reduce of cross-atom intents collected during worker phase.
            {
                const energies = new Int32Array(sharedBuffer, OFFSETS.ENERGY_OFFSET, MAX_ATOMS);
                const resonances = new Int32Array(sharedBuffer, OFFSETS.RESONANCE_OFFSET, MAX_ATOMS);
                const energyDelta = new Int32Array(sharedBuffer, OFFSETS.ENERGY_DELTA_OFFSET, MAX_ATOMS);
                const resonanceDelta = new Int32Array(sharedBuffer, OFFSETS.RESONANCE_DELTA_OFFSET, MAX_ATOMS);

                for (const idx of activeIdx) {
                    const de = Atomics.load(energyDelta, idx);
                    if (de !== 0) {
                        Atomics.add(energies, idx, de);
                        if (Atomics.load(energies, idx) < 0) Atomics.store(energies, idx, 0);
                        Atomics.store(energyDelta, idx, 0);
                    }

                    const dr = Atomics.load(resonanceDelta, idx);
                    if (dr !== 0) {
                        Atomics.add(resonances, idx, dr);
                        if (Atomics.load(resonances, idx) < 0) Atomics.store(resonances, idx, 0);
                        Atomics.store(resonanceDelta, idx, 0);
                    }
                }
            }
            // 2d. Deterministic reduce/apply of structure intents.
            {
                const structureGrid = new Int32Array(sharedBuffer, OFFSETS.STRUCTURE_GRID_OFFSET, GRID_CELLS);
                const buildOwners = new Int32Array(sharedBuffer, OFFSETS.STRUCTURE_BUILD_OWNER_OFFSET, GRID_CELLS);
                const buildValues = new Int32Array(sharedBuffer, OFFSETS.STRUCTURE_BUILD_VALUE_OFFSET, GRID_CELLS);
                const chargeIntents = new Int32Array(sharedBuffer, OFFSETS.STRUCTURE_CHARGE_INTENT_OFFSET, GRID_CELLS);

                for (let cellIdx = 0; cellIdx < GRID_CELLS; cellIdx++) {
                    const ownerRaw = Atomics.load(buildOwners, cellIdx);
                    if (ownerRaw !== 0) {
                        const owner = ownerRaw & 0x7fffffff;
                        if (owner !== 0) {
                            Atomics.store(structureGrid, cellIdx, Atomics.load(buildValues, cellIdx));
                        }
                        Atomics.store(buildOwners, cellIdx, 0);
                        Atomics.store(buildValues, cellIdx, 0);
                    }

                    const intentCharge = Atomics.load(chargeIntents, cellIdx);
                    if (intentCharge > 0) {
                        const charge = intentCharge > 255 ? 255 : intentCharge;
                        const current = Atomics.load(structureGrid, cellIdx);
                        const currentCharge = (current >>> 16) & 0xFF;
                        if (charge > currentCharge) {
                            Atomics.store(structureGrid, cellIdx, (current & ~0x00ff0000) | (charge << 16));
                        }
                        Atomics.store(chargeIntents, cellIdx, 0);
                    }
                }
            }

            // 3. Matrix Engine (WASM)
            const matrixPulseId = nextPulseId();
            await postAndWait(workers[0], { type: "TICK_MATRIX", pulseId: matrixPulseId }, "MATRIX_DONE");

            // --- TRANSITION TO HOST_LOCK ---
            // Matrix is now settled, workers are done. Lock for host-side logic & SNAPSHOTS.
            Atomics.store(syncState, 0, SYNC.HOST_LOCK);
            Atomics.notify(syncState, 0);

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
        } finally {
            Atomics.store(syncState, 0, SYNC.IDLE);
            Atomics.notify(syncState, 0);
        }
    }
};
