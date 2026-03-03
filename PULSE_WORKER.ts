// OMEGA-64 | PULSE_WORKER.ts | Era 68: Absolute Coherence
import * as OFFSETS from "./OFFSETS.ts";
import { LOGGER } from "./LOGGER.ts";

const MAX_ATOMS = OFFSETS.MAX_ATOMS;

let wasmInstance: WebAssembly.Instance | null = null;
let execute_atom_fn: (idx: number) => void;
let tick_matrix_fn: (() => void) | null = null;
let tick_structure_grid_fn: (() => void) | null = null;
let build_spatial_hash_fn: (() => void) | null = null;
let reduce_atom_deltas_fn: ((startIdx: number, endIdx: number) => void) | null =
  null;
let get_neural_coherence_fn: (() => number) | null = null;
let set_neural_coherence_fn: ((val: number) => void) | null = null;
let sharedBuffer: SharedArrayBuffer | null = null;
let syncStateView: Int32Array | null = null;
let idsView: BigUint64Array | null = null;
let debugDelayMs = 0;
let debugJitterMinMs = 0;
let debugJitterMaxMs = 0;
let debugJitterSeed = 0x9E3779B9;
const nextJitterUnit = (): number => {
  debugJitterSeed = (Math.imul(debugJitterSeed, 1664525) + 1013904223) >>> 0;
  return debugJitterSeed / 0x1_0000_0000;
};
const sampleJitterMs = (): number => {
  if (debugJitterMaxMs <= 0) return 0;
  const lo = Math.max(0, Math.min(2000, debugJitterMinMs));
  const hi = Math.max(lo, Math.min(2000, debugJitterMaxMs));
  if (hi === lo) return lo;
  return lo + Math.floor(nextJitterUnit() * (hi - lo + 1));
};
const maybeDelay = async () => {
  const totalDelay = debugDelayMs + sampleJitterMs();
  if (totalDelay <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, totalDelay));
};

self.onmessage = async (e) => {
  const { type, pulseId } = e.data;

  if (type === "INIT") {
    const { buffer, wasmMemory, workerIndex } = e.data;
    sharedBuffer = buffer;
    syncStateView = new Int32Array(sharedBuffer, OFFSETS.SYNC_STATE_OFFSET, 1);
    idsView = new BigUint64Array(sharedBuffer, OFFSETS.IDS_OFFSET, MAX_ATOMS);
    const idx = Number(workerIndex);
    if (Number.isFinite(idx)) {
      debugJitterSeed = (0x9E3779B9 ^ ((idx + 1) >>> 0)) >>> 0;
    }
    try {
      const wasmRes = await fetch(
        new URL("./build/release.wasm", import.meta.url).href,
      );
      const wasmBytes = await wasmRes.arrayBuffer();
      const instantiated = await WebAssembly.instantiate(wasmBytes, {
        env: {
          memory: wasmMemory,
          abort: (msg: any) => LOGGER.error("   [WASM ABORT]:", msg),
          trace_atom: (
            idx: number,
            op: number,
            gx: number,
            gy: number,
            target: number,
          ) => {
            if (idx <= 10) {
              LOGGER.debug(
                `   [WASM TRACE] Atom ${idx} | OP: 0x${
                  op.toString(16)
                } | Pos: (${gx},${gy}) | Target: ${target}`,
              );
            }
          },
        },
      });
      wasmInstance = instantiated.instance;
      execute_atom_fn = wasmInstance.exports.execute_atom as any;
      tick_matrix_fn = wasmInstance.exports.tick_matrix as any;
      tick_structure_grid_fn = wasmInstance.exports.tick_structure_grid as any;
      build_spatial_hash_fn = wasmInstance.exports.build_spatial_hash as any;
      reduce_atom_deltas_fn = wasmInstance.exports.reduce_atom_deltas as any;
      get_neural_coherence_fn = wasmInstance.exports
        .get_neural_coherence as any;
      set_neural_coherence_fn = wasmInstance.exports
        .set_neural_coherence as any;
      LOGGER.info("   [WORKER] WASM Instantiated successfully.");
      await maybeDelay();
      self.postMessage({ type: "READY" });
    } catch (err) {
      LOGGER.error("   [WORKER] WASM LOAD ERROR:", err);
      const error = err instanceof Error
        ? `${err.name}: ${err.message}`
        : String(err);
      self.postMessage({ type: "INIT_FAILED", error });
    }
    return;
  }

  if (type === "PULSE") {
    const { startIdx, endIdx } = e.data;
    if (!wasmInstance || !execute_atom_fn || !syncStateView || !idsView) return;

    // Wait for WASM_TICKING state (1)
    // If Host is locking (2) or Idle (0), we don't start yet.
    while (Atomics.load(syncStateView, 0) !== 1) {
      Atomics.wait(syncStateView, 0, 0, 1); // Wait if 0, expect 1
      if (Atomics.load(syncStateView, 0) === 2) {
        // If it's 2, we must wait for it to become 0 then 1
        Atomics.wait(syncStateView, 0, 2, 5);
      }
    }

    try {
      for (let i = startIdx; i < endIdx; i++) {
        const currentId = Atomics.load(idsView, i);
        if (currentId === 0n) continue;

        // Absolute WASM Coherence: The Kernel now handles Physics AND VM
        execute_atom_fn(i);
      }
    } catch (err) {
      LOGGER.error("   [WORKER EXECUTION ERROR]", err);
    }

    await maybeDelay();
    self.postMessage({ type: "DONE", pulseId });
  }

  if (type === "REDUCE_DELTAS") {
    const { startIdx, endIdx } = e.data;
    if (reduce_atom_deltas_fn) {
      reduce_atom_deltas_fn(startIdx, endIdx);
    }
    await maybeDelay();
    self.postMessage({ type: "DELTA_DONE", pulseId });
  }

  if (type === "TICK_MATRIX") {
    if (tick_structure_grid_fn) tick_structure_grid_fn();
    else if (tick_matrix_fn) tick_matrix_fn();
    await maybeDelay();
    self.postMessage({ type: "MATRIX_DONE", pulseId });
  }

  if (type === "BUILD_SPATIAL_HASH") {
    if (build_spatial_hash_fn) build_spatial_hash_fn();
    await maybeDelay();
    self.postMessage({ type: "HASH_DONE", pulseId });
  }

  if (type === "POLL_COHERENCE") {
    if (get_neural_coherence_fn) {
      const coherence = get_neural_coherence_fn();
      await maybeDelay();
      self.postMessage({ type: "COHERENCE_VAL", coherence, pulseId });
    }
  }

  if (type === "SET_COHERENCE") {
    if (set_neural_coherence_fn) {
      set_neural_coherence_fn(e.data.coherence);
    }
  }

  if (type === "SET_DEBUG_DELAY") {
    const delayRaw = Number(e.data.delayMs);
    debugDelayMs = Number.isFinite(delayRaw)
      ? Math.max(0, Math.min(2000, Math.floor(delayRaw)))
      : 0;
    await maybeDelay();
    self.postMessage({ type: "DEBUG_DELAY_SET", pulseId });
  }

  if (type === "SET_DEBUG_JITTER") {
    const minRaw = Number(e.data.minMs);
    const maxRaw = Number(e.data.maxMs);
    const minMs = Number.isFinite(minRaw)
      ? Math.max(0, Math.min(2000, Math.floor(minRaw)))
      : 0;
    const maxMs = Number.isFinite(maxRaw)
      ? Math.max(0, Math.min(2000, Math.floor(maxRaw)))
      : 0;
    debugJitterMinMs = Math.min(minMs, maxMs);
    debugJitterMaxMs = Math.max(minMs, maxMs);
    await maybeDelay();
    self.postMessage({
      type: "DEBUG_JITTER_SET",
      minMs: debugJitterMinMs,
      maxMs: debugJitterMaxMs,
      pulseId,
    });
  }
};
