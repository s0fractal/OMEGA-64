// OMEGA-64 | PULSE.ts | Era 68: Absolute Coherence
import { MAX_ATOMS, sharedBuffer, STATE_MATRIX } from "./STATE_MATRIX.ts";
import * as OFFSETS from "./OFFSETS.ts";
import { SOVEREIGN_ORACLE } from "./SOVEREIGN_ORACLE.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";
import { GATE } from "./GATE.ts";
import { LOGGER } from "./LOGGER.ts";
import { MUTATION_TELEMETRY } from "./MUTATION_TELEMETRY.ts";
import { CONTROL_INTENT_QUEUE } from "./CONTROL_INTENT_QUEUE.ts";
import { RUNTIME_POLICY } from "./RUNTIME_POLICY.ts";
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";

const WORKER_COUNT = RUNTIME_POLICY.pulse.workerCount;
const STRICT_DETERMINISM = RUNTIME_POLICY.pulse.strictDeterminism;
const WORKER_RESPONSE_TIMEOUT_MS = RUNTIME_POLICY.pulse.workerResponseTimeoutMs;
const WORKER_TIMEOUT_RETRY_COUNT = RUNTIME_POLICY.pulse.workerTimeoutRetryCount;
const WORKER_TIMEOUT_RETRY_MS = RUNTIME_POLICY.pulse.workerTimeoutRetryMs;
const WORKER_INIT_FALLBACK_ENABLED =
  RUNTIME_POLICY.pulse.workerInitFallbackEnabled;
const WASM_BOOT_POLICY = RUNTIME_POLICY.pulse.wasmBootPolicy;
const WASM_BOOT_PRECHECK_ENABLED = RUNTIME_POLICY.pulse.wasmBootPrecheckEnabled;
const FORCE_WASM_PREFLIGHT_FAIL = RUNTIME_POLICY.pulse.forceWasmPreflightFail;
const STARTUP_SELFTEST_ENABLED = RUNTIME_POLICY.pulse.startupSelfTestEnabled;
const STARTUP_SELFTEST_TICKS = RUNTIME_POLICY.pulse.startupSelfTestTicks;
const STARTUP_SELFTEST_FALLBACK_ENABLED =
  RUNTIME_POLICY.pulse.startupSelfTestFallbackEnabled;
const STARTUP_SELFTEST_QUIET = RUNTIME_POLICY.pulse.startupSelfTestQuiet;
const STARTUP_SELFTEST_FORCE_BREACH =
  RUNTIME_POLICY.pulse.startupSelfTestForceBreach;
const SPAWN_RING_CAPACITY = 1024;
const SPAWN_SLOT_BYTES = 16;
const WASM_RELEASE_URL = new URL("./build/release.wasm", import.meta.url);

let runtimeWorkerCount = WORKER_COUNT;
let startupSelfTestDone = false;
let startupSelfTestInProgress = false;
let startupSelfTestFallbackActivated = false;
let startupSelfTestLastBreachTick = -1;
let initFallbackActivated = false;
let initFallbackReason = "";
let wasmBootDegraded = false;
let wasmBootReason = "";
let wasmBootArtifactBytes = 0;
let wasmBootPrecheckCompleted = false;
const resetStartupSelfTestStateForColdStart = (): void => {
  startupSelfTestDone = false;
  startupSelfTestFallbackActivated = false;
  startupSelfTestLastBreachTick = -1;
  initFallbackActivated = false;
  initFallbackReason = "";
  wasmBootDegraded = false;
  wasmBootReason = "";
  wasmBootArtifactBytes = 0;
  wasmBootPrecheckCompleted = false;
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
const energiesView = new Int32Array(
  sharedBuffer,
  OFFSETS.ENERGY_OFFSET,
  MAX_ATOMS,
);
const resonancesView = new Int32Array(
  sharedBuffer,
  OFFSETS.RESONANCE_OFFSET,
  MAX_ATOMS,
);
const readXsView = new Int16Array(
  sharedBuffer,
  OFFSETS.PHYSICS_READ_XS_OFFSET,
  MAX_ATOMS,
);
const readYsView = new Int16Array(
  sharedBuffer,
  OFFSETS.PHYSICS_READ_YS_OFFSET,
  MAX_ATOMS,
);
const readEnergiesView = new Int32Array(
  sharedBuffer,
  OFFSETS.PHYSICS_READ_ENERGY_OFFSET,
  MAX_ATOMS,
);
const readResonancesView = new Int32Array(
  sharedBuffer,
  OFFSETS.PHYSICS_READ_RESONANCE_OFFSET,
  MAX_ATOMS,
);
const spawnHeadView = new Int32Array(
  sharedBuffer,
  OFFSETS.SPAWN_REQUESTS_OFFSET,
  2,
);
const spawnDataView = new DataView(
  sharedBuffer,
  OFFSETS.SPAWN_REQUESTS_OFFSET + 8,
  SPAWN_RING_CAPACITY * SPAWN_SLOT_BYTES,
);
const coherenceView = new Int32Array(sharedBuffer, OFFSETS.COHERENCE_OFFSET, 1);

const nextPulseId = (): number =>
  Date.now() + Math.floor(Math.random() * 1_000_000);
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
  let id = tickPart ^ genomePart ^ (BigInt(posBits) << 8n) ^ idxPart ^
    CHILD_ID_SALT;
  if (id === 0n) id = idxPart;
  return id === 0n ? 1n : id;
};
const findNextFreeSlot = (startIdx: number): number => {
  for (let i = startIdx; i < MAX_ATOMS; i++) {
    if (Atomics.load(idsView, i) === 0n) return i;
  }
  return -1;
};

type WasmPreflightReport = {
  ok: boolean;
  bytes: number;
  reason: string;
};
const wasmPreflight = async (): Promise<WasmPreflightReport> => {
  if (FORCE_WASM_PREFLIGHT_FAIL) {
    return {
      ok: false,
      bytes: 0,
      reason: "FORCED_WASM_PREFLIGHT_FAIL",
    };
  }
  try {
    const bytes = await Deno.readFile(WASM_RELEASE_URL);
    if (bytes.byteLength <= 0) {
      return { ok: false, bytes: 0, reason: "EMPTY_WASM_ARTIFACT" };
    }
    await WebAssembly.compile(bytes);
    return { ok: true, bytes: bytes.byteLength, reason: "" };
  } catch (err) {
    const reason = err instanceof Error
      ? `${err.name}: ${err.message}`
      : String(err);
    return { ok: false, bytes: 0, reason };
  }
};
const enterWasmSafeNoopMode = (reason: string): void => {
  wasmBootDegraded = true;
  wasmBootReason = reason;
  runtimeWorkerCount = 0;
  terminateWorkersInternal(false);
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

  constructor(
    expectedType: string,
    expectedPulseId: number | undefined,
    timeoutWindows: number,
  ) {
    super(
      `[PULSE] Worker timeout waiting for ${expectedType} (pulseId=${
        expectedPulseId ?? "n/a"
      }, windows=${timeoutWindows})`,
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
        reject(
          new WorkerTimeoutError(expectedType, expectedPulseId, timeoutWindows),
        );
      }, ms);
    };

    const listener = (e: MessageEvent) => {
      const data = e.data;
      if (!data || data.type !== expectedType) return;
      if (expectedPulseId !== undefined && data.pulseId !== expectedPulseId) {
        return;
      }
      const retriesUsed = timeoutWindows > 0
        ? Math.min(timeoutWindows, WORKER_TIMEOUT_RETRY_COUNT)
        : 0;
      cleanup();
      resolve({ data: data as T, timeoutWindows, retriesUsed });
    };
    worker.addEventListener("message", listener);
    armTimeout(timeoutMs);
  });
};

const waitForWorkerInit = (
  worker: Worker,
  workerIndex: number,
  timeoutMs: number = WORKER_RESPONSE_TIMEOUT_MS,
): Promise<void> => {
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
        reject(
          new Error(
            `[PULSE] Worker-${workerIndex} init timeout waiting for READY (windows=${timeoutWindows}).`,
          ),
        );
      }, ms);
    };

    const listener = (e: MessageEvent) => {
      const data = e.data;
      if (!data) return;
      if (data.type === "READY") {
        cleanup();
        if (timeoutWindows > 0) {
          LOGGER.warn(
            `   [PULSE] Worker-${workerIndex} recovered READY after ${timeoutWindows} timeout window(s).`,
          );
        }
        resolve();
        return;
      }
      if (data.type === "INIT_FAILED") {
        cleanup();
        const errMsg = typeof data.error === "string"
          ? data.error
          : "unknown init failure";
        reject(
          new Error(`[PULSE] Worker-${workerIndex} init failed: ${errMsg}`),
        );
      }
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
  const pulseId = typeof message.pulseId === "number"
    ? message.pulseId
    : undefined;
  stats.requests++;
  stats.lastRequestType = expectedType;
  stats.lastPulseId = pulseId ?? -1;
  const pending = waitForWorkerMessage<T>(
    worker,
    expectedType,
    pulseId,
    timeoutMs,
  );
  worker.postMessage(message);
  try {
    const res = await pending;
    if (res.timeoutWindows > 0) {
      stats.timeouts += res.timeoutWindows;
      stats.retryWaits += res.retriesUsed;
      LOGGER.warn(
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

const dispatchRangePhase = async (
  type: "PULSE" | "REDUCE_DELTAS",
  doneType: "DONE" | "DELTA_DONE",
): Promise<void> => {
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
      const endIdx = i === runtimeWorkerCount - 1
        ? MAX_ATOMS
        : Math.min(MAX_ATOMS, (i + 1) * chunkSize);

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
    const worker = new Worker(
      new URL("./PULSE_WORKER.ts", import.meta.url).href,
      { type: "module" },
    );
    workers.push(worker);
    workerFaultStats.push(makeWorkerFaultStat(i));

    const p = waitForWorkerInit(worker, i);
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
const terminateWorkersInternal = (resetStartupSelfTestState: boolean): void => {
  for (const worker of workers) {
    worker.terminate();
  }
  workers.length = 0;
  workerPromises = [];
  workerFaultStats.length = 0;
  if (resetStartupSelfTestState && !startupSelfTestInProgress) {
    resetStartupSelfTestStateForColdStart();
  }
};
const startWorkersWithInitFallback = async (count: number): Promise<void> => {
  try {
    await startWorkers(count);
  } catch (err) {
    terminateWorkersInternal(false);
    const primaryErr = err instanceof Error ? err.message : String(err);

    if (!WORKER_INIT_FALLBACK_ENABLED || count <= 1) {
      runtimeWorkerCount = 0;
      const failMsg = `[PULSE] Worker init failed: ${primaryErr}`;
      if (WASM_BOOT_POLICY === "safe-noop") {
        LOGGER.error(`${failMsg}. Entering safe-noop mode.`);
        enterWasmSafeNoopMode(failMsg);
        return;
      }
      throw new Error(failMsg);
    }

    runtimeWorkerCount = 1;
    initFallbackActivated = true;
    initFallbackReason = primaryErr;
    LOGGER.warn(
      `   [PULSE] Worker init failed; fallback to single worker. reason=${primaryErr}`,
    );

    try {
      await startWorkers(runtimeWorkerCount);
    } catch (fallbackErr) {
      terminateWorkersInternal(false);
      const fallbackMsg = fallbackErr instanceof Error
        ? fallbackErr.message
        : String(fallbackErr);
      runtimeWorkerCount = 0;
      const failMsg =
        `[PULSE] Worker init fallback failed: primary=${primaryErr}; fallback=${fallbackMsg}`;
      if (WASM_BOOT_POLICY === "safe-noop") {
        LOGGER.error(`${failMsg}. Entering safe-noop mode.`);
        enterWasmSafeNoopMode(failMsg);
        return;
      }
      throw new Error(failMsg);
    }
  }
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
    if (RUNTIME_POLICY.pulse.source.workerCount) {
      LOGGER.info(
        `   [PULSE] Worker override: OMEGA_PULSE_WORKERS=${runtimeWorkerCount}`,
      );
    }
    if (STRICT_DETERMINISM && runtimeWorkerCount > 1) {
      LOGGER.info(
        "   [PULSE] OMEGA_STRICT_DETERMINISM=1 -> serial execute on worker-0.",
      );
    }
    if (RUNTIME_POLICY.pulse.source.workerResponseTimeoutMs) {
      LOGGER.info(
        `   [PULSE] Worker timeout config: timeout=${WORKER_RESPONSE_TIMEOUT_MS}ms, retryCount=${WORKER_TIMEOUT_RETRY_COUNT}, retryMs=${WORKER_TIMEOUT_RETRY_MS}`,
      );
    }
    if (RUNTIME_POLICY.pulse.source.workerInitFallback) {
      LOGGER.info(
        `   [PULSE] Worker init fallback enabled=${WORKER_INIT_FALLBACK_ENABLED}.`,
      );
    }
    if (RUNTIME_POLICY.pulse.source.wasmBootPolicy) {
      LOGGER.info(`   [PULSE] WASM boot policy=${WASM_BOOT_POLICY}.`);
    }
    if (RUNTIME_POLICY.pulse.source.wasmBootPrecheck) {
      LOGGER.info(
        `   [PULSE] WASM precheck enabled=${WASM_BOOT_PRECHECK_ENABLED}.`,
      );
    }
    if (
      STARTUP_SELFTEST_ENABLED && runtimeWorkerCount > 1 &&
      RUNTIME_POLICY.pulse.source.startupSelfTest
    ) {
      LOGGER.info(
        `   [PULSE] Startup self-test enabled: ticks=${STARTUP_SELFTEST_TICKS}, fallback=${STARTUP_SELFTEST_FALLBACK_ENABLED}`,
      );
    }

    if (WASM_BOOT_PRECHECK_ENABLED) {
      const preflight = await wasmPreflight();
      wasmBootPrecheckCompleted = true;
      wasmBootArtifactBytes = preflight.bytes;
      if (!preflight.ok) {
        const failMsg = `[PULSE] WASM preflight failed: ${preflight.reason}`;
        if (WASM_BOOT_POLICY === "safe-noop") {
          LOGGER.error(`${failMsg}. Entering safe-noop mode.`);
          enterWasmSafeNoopMode(failMsg);
          return;
        }
        throw new Error(failMsg);
      }
    }

    await startWorkersWithInitFallback(runtimeWorkerCount);
    if (wasmBootDegraded) return;

    if (initFallbackActivated) {
      LOGGER.warn(
        `   [PULSE] ${runtimeWorkerCount} Worker READY after init fallback.`,
      );
    } else {
      LOGGER.info(
        `   [PULSE] ${runtimeWorkerCount} Parallel Workers READY with WASM VMs.`,
      );
    }

    if (
      !startupSelfTestDone && !startupSelfTestInProgress &&
      STARTUP_SELFTEST_ENABLED && runtimeWorkerCount > 1
    ) {
      await PULSE.runStartupSelfTest();
    }
  },
  runStartupSelfTest: async () => {
    if (
      startupSelfTestDone || startupSelfTestInProgress ||
      !STARTUP_SELFTEST_ENABLED
    ) return;
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
    const baseLevel = LOGGER.getLevel();
    startupSelfTestInProgress = true;
    startupSelfTestLastBreachTick = -1;

    if (
      STARTUP_SELFTEST_QUIET &&
      (baseLevel === "debug" || baseLevel === "info")
    ) {
      LOGGER.setLevel("warn");
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

      LOGGER.warn(
        `   [PULSE] Startup self-test breach at tick=${startupSelfTestLastBreachTick} workers=${runtimeWorkerCount}.`,
      );
      if (!STARTUP_SELFTEST_FALLBACK_ENABLED || runtimeWorkerCount <= 1) {
        throw new Error(
          "[PULSE] Startup self-test failed and fallback is disabled.",
        );
      }

      startupSelfTestFallbackActivated = true;
      PULSE.stopWorkers();
      runtimeWorkerCount = 1;
      await startWorkers(runtimeWorkerCount);
      LOGGER.warn(
        "   [PULSE] Startup self-test fallback activated: forcing single-worker mode.",
      );

      STATE_MATRIX.clear();
      Atomics.store(tickCounter, 0, 0);
      for (let t = 0; t < STARTUP_SELFTEST_TICKS; t++) {
        await PULSE.tick();
        if (startupSelfTestBreached()) {
          throw new Error(
            `[PULSE] Startup self-test failed after fallback (tick=${t}).`,
          );
        }
      }

      startupSelfTestDone = true;
    } finally {
      LOGGER.setLevel(baseLevel);
      STATE_MATRIX.clear();
      Atomics.store(tickCounter, 0, originalTick);
      Atomics.store(syncState, 0, SYNC.IDLE);
      Atomics.notify(syncState, 0);
      startupSelfTestInProgress = false;
    }
  },
  stopWorkers: () => {
    terminateWorkersInternal(true);
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
    initFallbackEnabled: WORKER_INIT_FALLBACK_ENABLED,
    initFallbackActivated,
    initFallbackReason,
    wasmBootPolicy: WASM_BOOT_POLICY,
    wasmBootPrecheckEnabled: WASM_BOOT_PRECHECK_ENABLED,
    wasmBootPrecheckCompleted,
    wasmBootArtifactBytes,
    wasmBootDegraded,
    wasmBootReason,
  }),
  getWorkerFaultStats: (): WorkerFaultStat[] =>
    workerFaultStats.map((stat) => ({ ...stat })),
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
        {
          type: "SET_DEBUG_JITTER",
          minMs: boundedMin,
          maxMs: boundedMax,
          pulseId,
        },
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
    if (wasmBootDegraded) {
      return;
    }
    if (workers.length === 0) {
      throw new Error(
        `[PULSE] No workers ready for tick. reason=${
          wasmBootReason || "WORKERS_UNAVAILABLE"
        }`,
      );
    }

    const { syncState, tickCounter, SYNC } = STATE_MATRIX;
    try {
      // 0. Sovereign Oracle Peak Detection & Coherence Polling
      const currentTick = Atomics.load(tickCounter, 0);
      PULSE.currentPulseId = currentTick;
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
        LOGGER.debug(
          `🧠 [PULSE] High Coherence detected: ${coherence}. Consulting Oracle...`,
        );
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
      let clearedBondRequests = 0;
      let resolvedBondPairs = 0;
      for (const i of activeIdx) {
        if (STATE_MATRIX.hasBondRequest(i)) {
          const targetIdx = STATE_MATRIX.getBondRequestTarget(i);
          if (targetIdx > 0 && targetIdx < MAX_ATOMS) {
            STATE_MATRIX.setBondTarget(i, 0, targetIdx);
            STATE_MATRIX.setBondStiffness(i, 0, 0.1);
            STATE_MATRIX.setBondTarget(targetIdx, 1, i);
            STATE_MATRIX.setBondStiffness(targetIdx, 1, 0.1);
            resolvedBondPairs++;
          }
          STATE_MATRIX.clearBondRequest(i);
          clearedBondRequests++;
        }
      }
      if (resolvedBondPairs > 0) {
        MUTATION_TELEMETRY.record({
          lane: "internal_host",
          kind: "bond_pair_resolution",
          count: resolvedBondPairs,
        });
      }
      if (clearedBondRequests > 0) {
        MUTATION_TELEMETRY.record({
          lane: "internal_host",
          kind: "bond_request_clear",
          count: clearedBondRequests,
        });
      }

      // 2. Parallel Physics & WASM Kernel
      // 2a. Rebuild Spatial Lattice (WASM)
      const hashPulseId = nextPulseId();
      await postAndWait(0, workers[0], {
        type: "BUILD_SPATIAL_HASH",
        pulseId: hashPulseId,
      }, "HASH_DONE");

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
      await postAndWait(0, workers[0], {
        type: "TICK_MATRIX",
        pulseId: matrixPulseId,
      }, "MATRIX_DONE");

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
              const childId = deriveChildId(
                currentTick,
                freeIdx,
                genomeLo,
                genomeHi,
                cx,
                cy,
              );
              genomeWords[0] = genomeLo;
              genomeWords[1] = genomeHi;

              // Seed atom with standard biological script and genome
              STATE_MATRIX.seedAtom(
                freeIdx,
                childId,
                cx * 10 + 5,
                cy * 10 + 5,
                Math.max(childEnergy, 500) / STATE_MATRIX.SCALE,
                0,
                genome,
              );
              activeIdx.push(freeIdx);
              spawned++;
            }
            spawnDataView.setUint32(slotOff, 0, true);
          }
          cursor = (cursor + 1) % SPAWN_RING_CAPACITY;
        }
        Atomics.store(spawnHeadView, 1, cursor);
        if (spawned > 0) {
          LOGGER.debug(
            `🌱 [PULSE] Spawned ${spawned} atoms with RISC boot scripts.`,
          );
          MUTATION_TELEMETRY.record({
            lane: "internal_host",
            kind: "spawn_seed_atom",
            count: spawned,
          });
        }
      }

      // 5. Sequential Maintenance (Sequential JS)
      // (WASM handled spatial and structure grid propagation during the parallel/matrix phases)
      const oracleDrain = SOVEREIGN_ORACLE.drainPendingMutations();
      if (oracleDrain.applied > 0 || oracleDrain.dropped > 0) {
        LOGGER.debug(
          `👁️ [ORACLE] Host-lock drain applied=${oracleDrain.applied} skipped=${oracleDrain.skipped} dropped=${oracleDrain.dropped}`,
        );
      }
      const controlDrain = await CONTROL_INTENT_QUEUE.applyHostLockBudget();
      if (controlDrain.drained > 0 || controlDrain.failed > 0) {
        LOGGER.debug(
          `🎛️ [CONTROL] Host-lock drain drained=${controlDrain.drained} applied=${controlDrain.applied} failed=${controlDrain.failed} remaining=${controlDrain.remaining}`,
        );
      }

      // Decay host pheromone fields (including observer attention).
      PHYSICS_ENGINE.decayPheromones();

      // 7. Autonomous Systemic Audit (Every 5 ticks)
      if (currentTick % 5 === 0) {
        MUTATION_TELEMETRY.record({
          lane: "canonical_gate",
          kind: "audit_matrix_cycle",
          count: 1,
        });
        GATE.auditMatrix(STATE_MATRIX);
      }

      // --- RESONANCE PROTOCOL: Global Coherence Calculation ---
      {
        let totalResonance = 0;
        for (const idx of activeIdx) {
          totalResonance += resonancesView[idx];
        }
        // Average Resonance normalized to 0-255 (Absolute Coherence)
        const avgRes = activeIdx.length > 0
          ? (totalResonance / activeIdx.length)
          : 0;
        const coherence = Math.min(255, Math.floor(avgRes / 100));

        // Write to Unified Lattice
        Atomics.store(coherenceView, 0, coherence);

        if (currentTick % 20 === 0) {
          LOGGER.debug(
            `💎 [RESONANCE] System Coherence: ${coherence}/255 (Avg Res: ${
              (avgRes / 100).toFixed(1)
            })`,
          );
        }
      }

      MUTATION_TELEMETRY.flushIfDue(currentTick);

      // Increment Global Tick Counter
      Atomics.add(tickCounter, 0, 1);
    } finally {
      Atomics.store(syncState, 0, SYNC.IDLE);
      Atomics.notify(syncState, 0);
    }
  },
};
