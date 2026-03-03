// OMEGA-64 | PULSE_WORKER.ts | Era 68: Absolute Coherence
import * as OFFSETS from "./OFFSETS.ts";

const MAX_ATOMS = OFFSETS.MAX_ATOMS;

let wasmInstance: WebAssembly.Instance | null = null;
let execute_atom_fn: (idx: number) => void;
let tick_matrix_fn: (() => void) | null = null;
let tick_structure_grid_fn: (() => void) | null = null;
let build_spatial_hash_fn: (() => void) | null = null;
let reduce_atom_deltas_fn: ((startIdx: number, endIdx: number) => void) | null = null;
let get_neural_coherence_fn: (() => number) | null = null;
let set_neural_coherence_fn: ((val: number) => void) | null = null;
let sharedBuffer: SharedArrayBuffer | null = null;
let syncStateView: Int32Array | null = null;
let idsView: BigUint64Array | null = null;

self.onmessage = async (e) => {
    const { type, pulseId } = e.data;

    if (type === "INIT") {
        const { buffer, wasmMemory } = e.data;
        sharedBuffer = buffer;
        syncStateView = new Int32Array(sharedBuffer, OFFSETS.SYNC_STATE_OFFSET, 1);
        idsView = new BigUint64Array(sharedBuffer, OFFSETS.IDS_OFFSET, MAX_ATOMS);
        try {
            const wasmRes = await fetch(new URL("./build/release.wasm", import.meta.url).href);
            const wasmBytes = await wasmRes.arrayBuffer();
            const instantiated = await WebAssembly.instantiate(wasmBytes, {
                env: { 
                    memory: wasmMemory,
                    abort: (msg: any) => console.error("   [WASM ABORT]:", msg),
                    trace_atom: (idx: number, op: number, gx: number, gy: number, target: number) => {
                        if (idx <= 10) {
                            console.log(`   [WASM TRACE] Atom ${idx} | OP: 0x${op.toString(16)} | Pos: (${gx},${gy}) | Target: ${target}`);
                        }
                    }
                }
            });
            wasmInstance = instantiated.instance;
            execute_atom_fn = wasmInstance.exports.execute_atom as any;
            tick_matrix_fn = wasmInstance.exports.tick_matrix as any;
            tick_structure_grid_fn = wasmInstance.exports.tick_structure_grid as any;
            build_spatial_hash_fn = wasmInstance.exports.build_spatial_hash as any;
            reduce_atom_deltas_fn = wasmInstance.exports.reduce_atom_deltas as any;
            get_neural_coherence_fn = wasmInstance.exports.get_neural_coherence as any;
            set_neural_coherence_fn = wasmInstance.exports.set_neural_coherence as any;
            console.log("   [WORKER] WASM Instantiated successfully.");
            self.postMessage({ type: "READY" });
        } catch (err) {
            console.error("   [WORKER] WASM LOAD ERROR:", err);
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
            console.error("   [WORKER EXECUTION ERROR]", err);
        }

        self.postMessage({ type: "DONE", pulseId });
    }

    if (type === "REDUCE_DELTAS") {
        const { startIdx, endIdx } = e.data;
        if (reduce_atom_deltas_fn) {
            reduce_atom_deltas_fn(startIdx, endIdx);
        }
        self.postMessage({ type: "DELTA_DONE", pulseId });
    }

    if (type === "TICK_MATRIX") {
        if (tick_structure_grid_fn) tick_structure_grid_fn();
        else if (tick_matrix_fn) tick_matrix_fn();
        self.postMessage({ type: "MATRIX_DONE", pulseId });
    }

    if (type === "BUILD_SPATIAL_HASH") {
        if (build_spatial_hash_fn) build_spatial_hash_fn();
        self.postMessage({ type: "HASH_DONE", pulseId });
    }

    if (type === "POLL_COHERENCE") {
        if (get_neural_coherence_fn) {
            const coherence = get_neural_coherence_fn();
            self.postMessage({ type: "COHERENCE_VAL", coherence, pulseId });
        }
    }

    if (type === "SET_COHERENCE") {
        if (set_neural_coherence_fn) {
            set_neural_coherence_fn(e.data.coherence);
        }
    }
};
