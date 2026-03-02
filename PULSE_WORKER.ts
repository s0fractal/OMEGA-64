// OMEGA-64 | PULSE_WORKER.ts | Era 68: Absolute Coherence
import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";
import * as OFFSETS from "./OFFSETS.ts";

const MAX_ATOMS = OFFSETS.MAX_ATOMS;

let wasmInstance: WebAssembly.Instance | null = null;
let execute_atom_fn: (idx: number) => void;
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
            self.postMessage({ type: "READY" });
        } catch (err) {
            console.error("   [WORKER] WASM LOAD ERROR:", err);
        }
        return;
    }

    if (type === "PULSE") {
        const { startIdx, endIdx } = e.data;
        if (!wasmInstance || !execute_atom_fn || !sharedBuffer) return;

        const ids = new BigUint64Array(sharedBuffer, OFFSETS.IDS_OFFSET, MAX_ATOMS);
        const xs = new Int16Array(sharedBuffer, OFFSETS.XS_OFFSET, MAX_ATOMS);
        const ys = new Int16Array(sharedBuffer, OFFSETS.YS_OFFSET, MAX_ATOMS);
        const logic = new Uint8Array(sharedBuffer, OFFSETS.LOGIC_OFFSET, MAX_ATOMS * 8);
        const bonds = new Uint32Array(sharedBuffer, OFFSETS.BONDS_OFFSET, MAX_ATOMS * 4);
        const stiffs = new Float32Array(sharedBuffer, OFFSETS.STIFFNESS_OFFSET, MAX_ATOMS * 4);

        try {
            for (let i = startIdx; i < endIdx; i++) {
                const currentId = Atomics.load(ids, i);
                if (currentId === 0n) continue;

                let x = Atomics.load(xs, i);
                let y = Atomics.load(ys, i);

                // --- NEURAL VERIFICATION ISOLATION ---
                if (currentId <= 10n) {
                    execute_atom_fn(i);
                    continue;
                }

                const logicBytes = logic.subarray(i * 8, i * 8 + 8);
                const logicStr = Array.from(logicBytes).map(b => b.toString(16).padStart(2, '0')).join('');
                
                const { velX, velY } = PHYSICS_ENGINE.getGenomeVelocity(logicStr);
                const bondTargetView = bonds.subarray(i * 4, i * 4 + 4);
                const { fx, fy } = PHYSICS_ENGINE.applyBondSprings(i, x, y, bondTargetView, xs, ys, stiffs);
                
                x += Math.round(velX * 2 + fx);
                y += Math.round(velY * 2 + fy);

                Atomics.store(xs, i, x);
                Atomics.store(ys, i, y);

                execute_atom_fn(i);
            }
        } catch (err) {
            console.error("   [WORKER EXECUTION ERROR]", err);
        }

        self.postMessage({ type: "DONE", pulseId });
    }
};
