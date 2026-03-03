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
const parseBool = (raw: string | undefined, fallback: boolean): boolean => {
    if (raw === undefined) return fallback;
    const norm = raw.trim().toLowerCase();
    if (norm === "1" || norm === "true" || norm === "yes" || norm === "on") return true;
    if (norm === "0" || norm === "false" || norm === "no" || norm === "off") return false;
    return fallback;
};
const parseBoundedInt = (raw: string | undefined, fallback: number, min: number, max: number): number => {
    if (!raw) return fallback;
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
};
const parseWorkerTimeoutMs = (): number =>
    parseBoundedInt(Deno.env.get("OMEGA_WORKER_RESPONSE_TIMEOUT_MS"), 30_000, 10, 120_000);
const parseWorkerTimeoutRetryCount = (): number =>
    parseBoundedInt(Deno.env.get("OMEGA_WORKER_TIMEOUT_RETRY_COUNT"), 1, 0, 4);
const parseWorkerTimeoutRetryMs = (): number =>
    parseBoundedInt(Deno.env.get("OMEGA_WORKER_TIMEOUT_RETRY_MS"), 5_000, 10, 120_000);
const parseStartupSelfTestEnabled = (): boolean =>
    parseBool(Deno.env.get("OMEGA_STARTUP_SELFTEST"), true);
const parseStartupSelfTestTicks = (): number =>
    parseBoundedInt(Deno.env.get("OMEGA_STARTUP_SELFTEST_TICKS"), 3, 1, 32);
const parseStartupSelfTestFallbackEnabled = (): boolean =>
    parseBool(Deno.env.get("OMEGA_STARTUP_SELFTEST_FALLBACK"), true);
const parseStartupSelfTestQuiet = (): boolean =>
    parseBool(Deno.env.get("OMEGA_STARTUP_SELFTEST_QUIET"), true);
const parseStartupSelfTestForceBreach = (): boolean =>
    parseBool(Deno.env.get("OMEGA_STARTUP_SELFTEST_FORCE_BREACH"), false);
const WORKER_COUNT = parseWorkerCount();
const STRICT_DETERMINISM = parseStrictDeterminism();
const WORKER_RESPONSE_TIMEOUT_MS = parseWorkerTimeoutMs();
const WORKER_TIMEOUT_RETRY_COUNT = parseWorkerTimeoutRetryCount();
const WORKER_TIMEOUT_RETRY_MS = parseWorkerTimeoutRetryMs();
const STARTUP_SELFTEST_ENABLED = parseStartupSelfTestEnabled();
const STARTUP_SELFTEST_TICKS = parseStartupSelfTestTicks();
const STARTUP_SELFTEST_FALLBACK_ENABLED = parseStartupSelfTestFallbackEnabled();
const STARTUP_SELFTEST_QUIET = parseStartupSelfTestQuiet();
const STARTUP_SELFTEST_FORCE_BREACH = parseStartupSelfTestForceBreach();
const SPAWN_RING_CAPACITY = 1024;
const SPAWN_SLOT_BYTES = 16;

let runtimeWorkerCount = WORKER_COUNT;
let startupSelfTestDone = false;
let startupSelfTestInProgress = false;
let startupSelfTestFallbackActivated = false;
let startupSelfTestLastBreachTick = -1;
const resetStartupSelfTestStateForColdStart = (): void => {
    startupSelfTestDone = false;
    startupSelfTestFallbackActivated = false;
    startupSelfTestLastBreachTick = -1;
};

const workers: Worker[] = [];
let workerPromises: Promise<any>[] = [];

type WorkerFaultStat = {
    workerIndex: number;
    requests: number;
    completed: number;
    timeouts: number;
    retryWaits: number;
    failures: number;
    consecutiveTimeouts: number;
    lastRequestType: string;
    lastPulseId: number;
    lastError: string;
};
const makeWorkerFaultStat = (workerIndex: number): WorkerFaultStat => ({
    workerIndex,
    requests: 0,
    completed: 0,
    timeouts: 0,
    retryWaits: 0,
    failures: 0,
    consecutiveTimeouts: 0,
    lastRequestType: "NONE",
    lastPulseId: -1,
    lastError: "",
});
const workerFaultStats: WorkerFaultStat[] = [];
const getWorkerFaultStat = (workerIndex: number): WorkerFaultStat => {
    if (!workerFaultStats[workerIndex]) {
        workerFaultStats[workerIndex] = makeWorkerFaultStat(workerIndex);
    }
    return workerFaultStats[workerIndex];
};

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
const CHILD_ID_SALT = 0x9E3779B97F4A7C15n;
const deriveChildId = (
    tick: number,
    freeIdx: number,
    genomeLo: number,
    genomeHi: number,
    cx: number,
    cy: number,
): bigint => {
    const tickPart = BigInt(tick >>> 0) << 32n;
    const idxPart = BigInt((freeIdx + 1) >>> 0);
    const genomePart = (BigInt(genomeLo >>> 0) << 32n) | BigInt(genomeHi >>> 0);
    const posBits = (((cx & 0xFFFF) << 16) | (cy & 0xFFFF)) >>> 0;
    let id = tickPart ^ genomePart ^ (BigInt(posBits) << 8n) ^ idxPart ^ CHILD_ID_SALT;
    if (id === 0n) id = idxPart;
    return id === 0n ? 1n : id;
};
const findNextFreeSlot = (startIdx: number): number => {
    for (let i = startIdx; i < MAX_ATOMS; i++) {
        if (Atomics.load(idsView, i) === 0n) return i;
    }
    return -1;
};

type WorkerWaitResult<T> = {
    data: T;
    timeoutWindows: number;
    retriesUsed: number;
};
class WorkerTimeoutError extends Error {
    timeoutWindows: number;
    expectedType: string;
    expectedPulseId?: number;

    constructor(expectedType: string, expectedPulseId: number | undefined, timeoutWindows: number) {
        super(
            `[PULSE] Worker timeout waiting for ${expectedType} (pulseId=${expectedPulseId ?? "n/a"}, windows=${timeoutWindows})`,
        );
        this.name = "WorkerTimeoutError";
        this.timeoutWindows = timeoutWindows;
        this.expectedType = expectedType;
        this.expectedPulseId = expectedPulseId;
    }
}

const waitForWorkerMessage = <T = any>(
    worker: Worker,
    expectedType: string,
    expectedPulseId?: number,
    timeoutMs: number = WORKER_RESPONSE_TIMEOUT_MS,
): Promise<WorkerWaitResult<T>> => {
    return new Promise((resolve, reject) => {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        let remainingRetries = WORKER_TIMEOUT_RETRY_COUNT;
        let timeoutWindows = 0;

        const cleanup = () => {
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            worker.removeEventListener("message", listener);
        };

        const armTimeout = (ms: number) => {
            timeoutId = setTimeout(() => {
                timeoutWindows++;
                if (remainingRetries > 0) {
                    remainingRetries--;
                    armTimeout(WORKER_TIMEOUT_RETRY_MS);
                    return;
                }
                cleanup();
                reject(new WorkerTimeoutError(expectedType, expectedPulseId, timeoutWindows));
            }, ms);
        };

        const listener = (e: MessageEvent) => {
            const data = e.data;
            if (!data || data.type !== expectedType) return;
            if (expectedPulseId !== undefined && data.pulseId !== expectedPulseId) return;
            const retriesUsed = timeoutWindows > 0 ? Math.min(timeoutWindows, WORKER_TIMEOUT_RETRY_COUNT) : 0;
            cleanup();
            resolve({ data: data as T, timeoutWindows, retriesUsed });
        };
        worker.addEventListener("message", listener);
        armTimeout(timeoutMs);
    });
};

const postAndWait = async <T = any>(
    workerIndex: number,
    worker: Worker,
    message: Record<string, unknown>,
    expectedType: string,
    timeoutMs?: number,
): Promise<T> => {
    const stats = getWorkerFaultStat(workerIndex);
    const pulseId = typeof message.pulseId === "number" ? message.pulseId : undefined;
    stats.requests++;
    stats.lastRequestType = expectedType;
    stats.lastPulseId = pulseId ?? -1;
    const pending = waitForWorkerMessage<T>(worker, expectedType, pulseId, timeoutMs);
    worker.postMessage(message);
    try {
        const res = await pending;
        if (res.timeoutWindows > 0) {
            stats.timeouts += res.timeoutWindows;
            stats.retryWaits += res.retriesUsed;
            console.warn(
                `   [PULSE] Worker-${workerIndex} recovered ${expectedType} after ${res.timeoutWindows} timeout window(s).`,
            );
        }
        stats.completed++;
        stats.consecutiveTimeouts = 0;
        stats.lastError = "";
        return res.data;
    } catch (err) {
        if (err instanceof WorkerTimeoutError) {
            stats.timeouts += err.timeoutWindows;
            stats.retryWaits += Math.max(0, err.timeoutWindows - 1);
        }
        stats.failures++;
        stats.consecutiveTimeouts++;
        stats.lastError = err instanceof Error ? err.message : String(err);
        throw err;
    }
};

const dispatchRangePhase = async (type: "PULSE" | "REDUCE_DELTAS", doneType: "DONE" | "DELTA_DONE"): Promise<void> => {
    workerPromises = [];
    if (STRICT_DETERMINISM && runtimeWorkerCount > 1) {
        const pulseId = nextPulseId();
        workerPromises.push(postAndWait(
            0,
            workers[0],
            { type, startIdx: 0, endIdx: MAX_ATOMS, pulseId },
            doneType,
        ));
    } else {
        const chunkSize = Math.ceil(MAX_ATOMS / runtimeWorkerCount);
        for (let i = 0; i < runtimeWorkerCount; i++) {
            const startIdx = i * chunkSize;
            const endIdx = i === runtimeWorkerCount - 1 ? MAX_ATOMS : Math.min(MAX_ATOMS, (i + 1) * chunkSize);

            const pulseId = nextPulseId();
            workerPromises.push(postAndWait(
                i,
                workers[i],
                { type, startIdx, endIdx, pulseId },
                doneType,
            ));
        }
    }
    await Promise.all(workerPromises);
};
const startWorkers = async (count: number): Promise<void> => {
    workerFaultStats.length = 0;
    workerPromises = [];
    for (let i = 0; i < count; i++) {
        const worker = new Worker(new URL("./PULSE_WORKER.ts", import.meta.url).href, { type: "module" });
        workers.push(worker);
        workerFaultStats.push(makeWorkerFaultStat(i));

        const p = waitForWorkerMessage(worker, "READY");
        worker.postMessage({
            type: "INIT",
            wasmMemory: STATE_MATRIX.wasmMemory,
            buffer: STATE_MATRIX.buffer,
            workerIndex: i,
        });
        workerPromises.push(p.then(() => undefined));
    }
    await Promise.all(workerPromises);
};
const startupSelfTestBreached = (): boolean => {
    if (Atomics.load(idsView, 0) !== 0n) return true;
    return STATE_MATRIX.getActiveIndices().length !== 0;
};

export const PULSE = {
    currentPulseId: Date.now(),
    initWorkers: async (requestedWorkerCount?: number) => {
        if (workers.length > 0) return;
        resetStartupSelfTestStateForColdStart();
        runtimeWorkerCount = requestedWorkerCount === undefined
            ? WORKER_COUNT
            : Math.max(1, Math.min(32, Math.floor(requestedWorkerCount)));
        if (Deno.env.get("OMEGA_PULSE_WORKERS")) {
            console.log(`   [PULSE] Worker override: OMEGA_PULSE_WORKERS=${runtimeWorkerCount}`);
        }
        if (STRICT_DETERMINISM && runtimeWorkerCount > 1) {
            console.log("   [PULSE] OMEGA_STRICT_DETERMINISM=1 -> serial execute on worker-0.");
        }
        if (Deno.env.get("OMEGA_WORKER_RESPONSE_TIMEOUT_MS")) {
            console.log(
                `   [PULSE] Worker timeout config: timeout=${WORKER_RESPONSE_TIMEOUT_MS}ms, retryCount=${WORKER_TIMEOUT_RETRY_COUNT}, retryMs=${WORKER_TIMEOUT_RETRY_MS}`,
            );
        }
        if (STARTUP_SELFTEST_ENABLED && runtimeWorkerCount > 1 && Deno.env.get("OMEGA_STARTUP_SELFTEST") !== undefined) {
            console.log(
                `   [PULSE] Startup self-test enabled: ticks=${STARTUP_SELFTEST_TICKS}, fallback=${STARTUP_SELFTEST_FALLBACK_ENABLED}`,
            );
        }

        await startWorkers(runtimeWorkerCount);
        console.log(`   [PULSE] ${runtimeWorkerCount} Parallel Workers READY with WASM VMs.`);

        if (!startupSelfTestDone && !startupSelfTestInProgress && STARTUP_SELFTEST_ENABLED && runtimeWorkerCount > 1) {
            await PULSE.runStartupSelfTest();
        }
    },
    runStartupSelfTest: async () => {
        if (startupSelfTestDone || startupSelfTestInProgress || !STARTUP_SELFTEST_ENABLED) return;
        if (workers.length === 0 || runtimeWorkerCount <= 1) {
            startupSelfTestDone = true;
            return;
        }
        if (STATE_MATRIX.getActiveIndices().length !== 0) {
            // Do not mutate populated worlds; this gate is for cold-start only.
            startupSelfTestDone = true;
            return;
        }

        const { tickCounter, syncState, SYNC } = STATE_MATRIX;
        const originalTick = Atomics.load(tickCounter, 0);
        const baseLog = console.log.bind(console);
        startupSelfTestInProgress = true;
        startupSelfTestLastBreachTick = -1;

        if (STARTUP_SELFTEST_QUIET) {
            console.log = () => {};
        }

        try {
            for (let t = 0; t < STARTUP_SELFTEST_TICKS; t++) {
                await PULSE.tick();
                if (STARTUP_SELFTEST_FORCE_BREACH && t === 0) {
                    Atomics.store(idsView, 0, 1n);
                }
                if (startupSelfTestBreached()) {
                    startupSelfTestLastBreachTick = t;
                    break;
                }
            }

            if (startupSelfTestLastBreachTick === -1) {
                startupSelfTestDone = true;
                return;
            }

            console.warn(
                `   [PULSE] Startup self-test breach at tick=${startupSelfTestLastBreachTick} workers=${runtimeWorkerCount}.`,
            );
            if (!STARTUP_SELFTEST_FALLBACK_ENABLED || runtimeWorkerCount <= 1) {
                throw new Error("[PULSE] Startup self-test failed and fallback is disabled.");
            }

            startupSelfTestFallbackActivated = true;
            PULSE.stopWorkers();
            runtimeWorkerCount = 1;
            await startWorkers(runtimeWorkerCount);
            console.warn("   [PULSE] Startup self-test fallback activated: forcing single-worker mode.");

            STATE_MATRIX.clear();
            Atomics.store(tickCounter, 0, 0);
            for (let t = 0; t < STARTUP_SELFTEST_TICKS; t++) {
                await PULSE.tick();
                if (startupSelfTestBreached()) {
                    throw new Error(`[PULSE] Startup self-test failed after fallback (tick=${t}).`);
                }
            }

            startupSelfTestDone = true;
        } finally {
            if (STARTUP_SELFTEST_QUIET) {
                console.log = baseLog;
            }
            STATE_MATRIX.clear();
            Atomics.store(tickCounter, 0, originalTick);
            Atomics.store(syncState, 0, SYNC.IDLE);
            Atomics.notify(syncState, 0);
            startupSelfTestInProgress = false;
        }
    },
    stopWorkers: () => {
        for (const worker of workers) {
            worker.terminate();
        }
        workers.length = 0;
        workerPromises = [];
        workerFaultStats.length = 0;
        if (!startupSelfTestInProgress) {
            resetStartupSelfTestStateForColdStart();
        }
    },
    getRuntimeWorkerCount: (): number => runtimeWorkerCount,
    getStartupSelfTestStatus: () => ({
        enabled: STARTUP_SELFTEST_ENABLED,
        ticks: STARTUP_SELFTEST_TICKS,
        done: startupSelfTestDone,
        inProgress: startupSelfTestInProgress,
        fallbackEnabled: STARTUP_SELFTEST_FALLBACK_ENABLED,
        fallbackActivated: startupSelfTestFallbackActivated,
        lastBreachTick: startupSelfTestLastBreachTick,
    }),
    getWorkerFaultStats: (): WorkerFaultStat[] => workerFaultStats.map((stat) => ({ ...stat })),
    setWorkerDebugDelay: async (delayMs: number): Promise<void> => {
        if (workers.length === 0) return;
        const boundedDelay = Math.max(0, Math.min(2000, Math.floor(delayMs)));
        const updates: Promise<any>[] = [];
        for (let i = 0; i < workers.length; i++) {
            const pulseId = nextPulseId();
            updates.push(postAndWait(
                i,
                workers[i],
                { type: "SET_DEBUG_DELAY", delayMs: boundedDelay, pulseId },
                "DEBUG_DELAY_SET",
                Math.max(1_000, WORKER_RESPONSE_TIMEOUT_MS),
            ));
        }
        await Promise.all(updates);
    },
    setWorkerDebugJitter: async (minMs: number, maxMs: number): Promise<void> => {
        if (workers.length === 0) return;
        const boundedMin = Math.max(0, Math.min(2000, Math.floor(minMs)));
        const boundedMax = Math.max(0, Math.min(2000, Math.floor(maxMs)));
        const updates: Promise<any>[] = [];
        for (let i = 0; i < workers.length; i++) {
            const pulseId = nextPulseId();
            updates.push(postAndWait(
                i,
                workers[i],
                { type: "SET_DEBUG_JITTER", minMs: boundedMin, maxMs: boundedMax, pulseId },
                "DEBUG_JITTER_SET",
                Math.max(1_000, WORKER_RESPONSE_TIMEOUT_MS),
            ));
        }
        await Promise.all(updates);
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
                0,
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
            await postAndWait(0, workers[0], { type: "BUILD_SPATIAL_HASH", pulseId: hashPulseId }, "HASH_DONE");

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
            await postAndWait(0, workers[0], { type: "TICK_MATRIX", pulseId: matrixPulseId }, "MATRIX_DONE");

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
                            const childId = deriveChildId(currentTick, freeIdx, genomeLo, genomeHi, cx, cy);
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
