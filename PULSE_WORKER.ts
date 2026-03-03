// OMEGA-64 | PULSE_WORKER.ts | Era 68: Absolute Coherence
import * as OFFSETS from "./OFFSETS.ts";

const MAX_ATOMS = OFFSETS.MAX_ATOMS;

let wasmInstance: WebAssembly.Instance | null = null;
let execute_atom_fn: (idx: number) => void;
let tick_matrix_fn: (() => void) | null = null;
let reduce_atom_deltas_fn: ((startIdx: number, endIdx: number) => void) | null = null;
let get_neural_coherence_fn: (() => number) | null = null;
let set_neural_coherence_fn: ((val: number) => void) | null = null;
let sharedBuffer: SharedArrayBuffer | null = null;

self.onmessage = async (e) => {
    const { type, pulseId } = e.data;

    if (type === "INIT") {
        const { buffer, wasmMemory } = e.data;
        sharedBuffer = buffer;
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
        if (!wasmInstance || !execute_atom_fn || !sharedBuffer) return;

        const syncState = new Int32Array(sharedBuffer, OFFSETS.SYNC_STATE_OFFSET, 1);
        
        // Wait for WASM_TICKING state (1)
        // If Host is locking (2) or Idle (0), we don't start yet.
        while (Atomics.load(syncState, 0) !== 1) {
            Atomics.wait(syncState, 0, 0, 1); // Wait if 0, expect 1
            if (Atomics.load(syncState, 0) === 2) {
                // If it's 2, we must wait for it to become 0 then 1
                Atomics.wait(syncState, 0, 2, 5); 
            }
        }

        const ids = new BigUint64Array(sharedBuffer, OFFSETS.IDS_OFFSET, MAX_ATOMS);
        const xs = new Int16Array(sharedBuffer, OFFSETS.XS_OFFSET, MAX_ATOMS);
        const ys = new Int16Array(sharedBuffer, OFFSETS.YS_OFFSET, MAX_ATOMS);
        const logic = new Uint8Array(sharedBuffer, OFFSETS.LOGIC_OFFSET, MAX_ATOMS * 8);
        const bonds = new Uint32Array(sharedBuffer, OFFSETS.BONDS_OFFSET, MAX_ATOMS * 4);
        const stiffs = new Float32Array(sharedBuffer, OFFSETS.STIFFNESS_OFFSET, MAX_ATOMS);
        const bondDists = new Uint8Array(sharedBuffer, OFFSETS.BOND_DISTANCES_OFFSET, MAX_ATOMS * 4);
        const dampings = new Uint8Array(sharedBuffer, OFFSETS.DAMPING_OFFSET, MAX_ATOMS);
        const roles = new Uint8Array(sharedBuffer, OFFSETS.ROLES_OFFSET, MAX_ATOMS);
        const structureGrid = new Int32Array(sharedBuffer, OFFSETS.STRUCTURE_GRID_OFFSET, 140 * 80);

        try {
            for (let i = startIdx; i < endIdx; i++) {
                const currentId = Atomics.load(ids, i);
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
        const tick_structure_grid = wasmInstance?.exports.tick_structure_grid as any;
        if (tick_structure_grid) tick_structure_grid();
        else if (tick_matrix_fn) tick_matrix_fn();
        self.postMessage({ type: "MATRIX_DONE", pulseId });
    }

    if (type === "BUILD_SPATIAL_HASH") {
        const build_spatial_hash = wasmInstance?.exports.build_spatial_hash as any;
        if (build_spatial_hash) build_spatial_hash();
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
