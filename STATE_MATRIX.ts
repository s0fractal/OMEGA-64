// OMEGA-64 | STATE_MATRIX.ts | Era 68: Absolute Coherence
import * as OFFSETS from "./OFFSETS.ts";

export const MAX_ATOMS = OFFSETS.MAX_ATOMS;
export const SCALE = OFFSETS.SCALE;

export const wasmMemory = new WebAssembly.Memory({ initial: 1024, maximum: 1024, shared: true });
export const sharedBuffer = wasmMemory.buffer as SharedArrayBuffer;

// TypedArray Views (Host side)
const ids = new BigUint64Array(sharedBuffer, OFFSETS.IDS_OFFSET, MAX_ATOMS);
const xs = new Int16Array(sharedBuffer, OFFSETS.XS_OFFSET, MAX_ATOMS);
const ys = new Int16Array(sharedBuffer, OFFSETS.YS_OFFSET, MAX_ATOMS);
const energies = new Int32Array(sharedBuffer, OFFSETS.ENERGY_OFFSET, MAX_ATOMS);
const resonances = new Int32Array(sharedBuffer, OFFSETS.RESONANCE_OFFSET, MAX_ATOMS);
const phases = new Int32Array(sharedBuffer, OFFSETS.PHASE_OFFSET, MAX_ATOMS);
const roles = new Uint8Array(sharedBuffer, OFFSETS.ROLES_OFFSET, MAX_ATOMS);
const logic = new Uint8Array(sharedBuffer, OFFSETS.LOGIC_OFFSET, MAX_ATOMS * 8);
const bonds = new Uint32Array(sharedBuffer, OFFSETS.BONDS_OFFSET, MAX_ATOMS * 4);
const bondStiffness = new Float32Array(sharedBuffer, OFFSETS.STIFFNESS_OFFSET, MAX_ATOMS * 4);
const spatialGrid = new Int32Array(sharedBuffer, OFFSETS.SPATIAL_GRID_OFFSET, 140 * 80 * 32);
const structureGrid = new Int32Array(sharedBuffer, OFFSETS.STRUCTURE_GRID_OFFSET, 140 * 80); // 1 int per cell (density/type)
const signalGrid = new Int32Array(sharedBuffer, OFFSETS.SIGNAL_GRID_OFFSET, 140 * 80);    // 1 int per cell (resonance)
const memoryGrid = new Uint8Array(sharedBuffer, OFFSETS.MEMORY_GRID_OFFSET, 140 * 80 * 8);

export const STATE_MATRIX = {
    MAX_ATOMS,
    buffer: sharedBuffer,
    wasmMemory,
    SCALE,
    phases,
    roles,
    spatialGrid,
    structureGrid,
    signalGrid,
    memoryGrid,
    
    getId: (i: number) => Atomics.load(ids, i),
    getX: (i: number) => Atomics.load(xs, i),
    getY: (i: number) => Atomics.load(ys, i),
    getRole: (i: number) => Atomics.load(roles, i),
    getEnergy: (i: number) => Atomics.load(energies, i) / SCALE,
    getResonance: (i: number) => Atomics.load(resonances, i),
    getPhase: (i: number) => Atomics.load(phases, i),
    getLogic: (i: number) => logic.subarray(i * 8, i * 8 + 8),
    getBonds: (i: number) => bonds.subarray(i * 4, i * 4 + 4),
    getBondTarget: (i: number, slot: number) => Atomics.load(bonds, i * 4 + slot),
    getBondStiffness: (i: number, slot: number) => bondStiffness[i * 4 + slot],
    
    setId: (i: number, val: bigint) => Atomics.store(ids, i, val),
    setX: (i: number, val: number) => Atomics.store(xs, i, Math.round(val)),
    setY: (i: number, val: number) => Atomics.store(ys, i, Math.round(val)),
    setRole: (i: number, val: number) => Atomics.store(roles, i, val),
    setEnergy: (i: number, val: number) => Atomics.store(energies, i, Math.round(val * SCALE)),
    setResonance: (i: number, val: number) => Atomics.store(resonances, i, val),
    setPhase: (i: number, val: number) => Atomics.store(phases, i, val),
    setLogic: (i: number, val: Uint8Array) => logic.set(val, i * 8),
    setBondTarget: (i: number, slot: number, target: number) => Atomics.store(bonds, i * 4 + slot, target),
    setBondStiffness: (i: number, slot: number, val: number) => { bondStiffness[i * 4 + slot] = val; },

    getBondRequest: (i: number) => {
        const req = new Int32Array(sharedBuffer, OFFSETS.BOND_REQUESTS_OFFSET + i * 12, 3);
        const initiator = Atomics.load(req, 0);
        return initiator !== 0 ? req : null;
    },
    clearBondRequest: (i: number) => Atomics.store(new Int32Array(sharedBuffer, OFFSETS.BOND_REQUESTS_OFFSET + i * 12, 1), 0, 0),

    clear: () => {
        new Uint8Array(sharedBuffer).fill(0); 
    },
    getActiveIndices: () => {
        const active: number[] = [];
        for (let i = 0; i < MAX_ATOMS; i++) {
            if (Atomics.load(ids, i) !== 0n) active.push(i);
        }
        return active;
    },

    findFreeSlot: (): number => {
        for (let i = 0; i < MAX_ATOMS; i++) {
            if (Atomics.load(ids, i) === 0n) return i;
        }
        return -1;
    },

    getMatrixResonance: () => {
        let total = 0;
        for (let i = 0; i < 140 * 80; i++) {
            total += Atomics.load(signalGrid, i);
        }
        return total;
    },

    getClusterSync: () => {
        // Heuristic: measure how many neighboring cells in the Matrix have similar high resonance
        let sync = 0;
        for (let i = 0; i < 140 * 80; i++) {
            const res = Atomics.load(signalGrid, i);
            if (res > 100) sync++;
        }
        return sync;
    },

    getMemorySummary: () => {
        // Implementation for Era 67 memetic summaries
        const counts = new Map<number, number>();
        for (let i = 0; i < 140 * 80; i++) {
            const energy = memoryGrid[i * 8] + (memoryGrid[i * 8 + 1] << 8);
            if (energy > 0) {
                const sig = memoryGrid[i * 8 + 4]; // First byte of meme
                counts.set(sig, (counts.get(sig) || 0) + 1);
            }
        }
        return Array.from(counts.entries()).map(([sig, count]) => ({ sig, count }));
    }
};
