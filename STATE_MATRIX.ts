// OMEGA-64 | STATE_MATRIX.ts | Era 8: The Structure-of-Arrays (SoA) Matrix
// High-performance memory layout for cache efficiency.

export const MAX_ATOMS = 100000;
export const ATOM_SIZE = 64; // Legacy constant for compatibility

// Memory offsets for SoA approach (Contiguous blocks per field)
const IDS_OFFSET = 0;
const XS_OFFSET = IDS_OFFSET + (MAX_ATOMS * 8); // ids (BigUint64)
const YS_OFFSET = XS_OFFSET + (MAX_ATOMS * 2); // xs (Int16)
const ENERGY_OFFSET = YS_OFFSET + (MAX_ATOMS * 2); // ys (Int16)
const RESONANCE_OFFSET = ENERGY_OFFSET + (MAX_ATOMS * 4); // energies (Int32)
const PHASE_OFFSET = RESONANCE_OFFSET + (MAX_ATOMS * 4); // resonances (Int32)
const LOGIC_OFFSET = PHASE_OFFSET + (MAX_ATOMS * 4); // phases (Int32)
const BONDS_OFFSET = LOGIC_OFFSET + (MAX_ATOMS * 8); // logic (Uint8 x 8)
const INSTRUCTIONS_OFFSET = BONDS_OFFSET + (MAX_ATOMS * 16); // bonds (Uint32 x 4)
const CONTEXT_OFFSET = INSTRUCTIONS_OFFSET + (MAX_ATOMS * 64); // instructions (Uint32 x 16)
const EVOLUTION_OFFSET = CONTEXT_OFFSET + (MAX_ATOMS * 32); // context (Uint8 x 32)
const TOTAL_BUFFER_SIZE = EVOLUTION_OFFSET; // We've moved evolution/viral to their own buffers for thread safety

const buffer = new SharedArrayBuffer(TOTAL_BUFFER_SIZE);
const evolutionRequestsBuffer = new SharedArrayBuffer(MAX_ATOMS);
const viralGridBuffer = new SharedArrayBuffer(70 * 40 * 9); // ERA 24: 8-byte logic + 1-byte intensity

// TypedArray Views (Structure of Arrays)
const ids = new BigUint64Array(buffer, IDS_OFFSET, MAX_ATOMS);
const xs = new Int16Array(buffer, XS_OFFSET, MAX_ATOMS);
const ys = new Int16Array(buffer, YS_OFFSET, MAX_ATOMS);
const energies = new Int32Array(buffer, ENERGY_OFFSET, MAX_ATOMS);
const resonances = new Int32Array(buffer, RESONANCE_OFFSET, MAX_ATOMS);
const phases = new Int32Array(buffer, PHASE_OFFSET, MAX_ATOMS);
const logic = new Uint8Array(buffer, LOGIC_OFFSET, MAX_ATOMS * 8);
const bonds = new Uint32Array(buffer, BONDS_OFFSET, MAX_ATOMS * 4);
const instructions = new Uint32Array(buffer, INSTRUCTIONS_OFFSET, MAX_ATOMS * 16);
const contexts = new Uint8Array(buffer, CONTEXT_OFFSET, MAX_ATOMS * 32);

const evolutionRequests = new Uint8Array(evolutionRequestsBuffer);
const viralGrid = new Uint8Array(viralGridBuffer);

const SCALE = 1000;

export const STATE_MATRIX = {
    MAX_ATOMS,
    buffer,
    SCALE,
    evolutionRequestsBuffer,
    viralGridBuffer,
    
    // --- ID ---
    getId: (idx: number) => Atomics.load(ids, idx),
    setId: (idx: number, id: bigint) => { Atomics.store(ids, idx, id); },

    // --- POSITIONS ---
    getX: (idx: number) => Atomics.load(xs, idx),
    setX: (idx: number, val: number) => { Atomics.store(xs, idx, val); },
    getY: (idx: number) => Atomics.load(ys, idx),
    setY: (idx: number, val: number) => { Atomics.store(ys, idx, val); },

    // --- METRICS (Fixed-Point) ---
    getEnergy: (idx: number) => Atomics.load(energies, idx) / SCALE,
    setEnergy: (idx: number, val: number) => { Atomics.store(energies, idx, Math.round(val * SCALE)); },
    getResonance: (idx: number) => Atomics.load(resonances, idx) / SCALE,
    setResonance: (idx: number, val: number) => { Atomics.store(resonances, idx, Math.round(val * SCALE)); },
    getPhase: (idx: number) => Atomics.load(phases, idx) / SCALE,
    setPhase: (idx: number, val: number) => { Atomics.store(phases, idx, Math.round(val * SCALE)); },

    // --- GENOME (8-Byte Header) ---
    getLogic: (idx: number) => logic.subarray(idx * 8, idx * 8 + 8),
    setLogic: (idx: number, bytes: Uint8Array) => {
        logic.set(bytes.subarray(0, 8), idx * 8);
    },

    // --- CODE (L5: Instruction Blocks) ---
    getCode: (idx: number) => instructions.subarray(idx * 16, idx * 16 + 16),
    setCode: (idx: number, code: Uint32Array) => {
        instructions.set(code.subarray(0, 16), idx * 16);
    },

    setContext: (idx: number, ctx: Uint8Array) => {
        contexts.set(ctx.subarray(0, 32), idx * 32);
    },

    // --- EVOLUTION (ERA 22) ---
    requestEvolution: (idx: number) => { Atomics.store(evolutionRequests, idx, 1); },
    clearEvolution: (idx: number) => { Atomics.store(evolutionRequests, idx, 0); },
    hasEvolved: (idx: number) => Atomics.load(evolutionRequests, idx) === 1,


    // --- BONDS ---
    getBonds: (idx: number) => bonds.subarray(idx * 4, idx * 4 + 4),
    setBonds: (idx: number, indices: Uint32Array) => {
        bonds.set(indices.subarray(0, 4), idx * 4);
    },

    // --- SYSTEM ---
    clear: () => {
        new Uint32Array(buffer).fill(0);
        new Uint8Array(evolutionRequestsBuffer).fill(0);
        new Uint8Array(viralGridBuffer).fill(0);
    },

    getActiveIndices: () => {
        const active: number[] = [];
        for (let i = 0; i < MAX_ATOMS; i++) {
            if (ids[i] !== 0n) {
                active.push(i);
            }
        }
        return active;
    },

    findEmptySlot: () => {
        for (let i = 1; i < MAX_ATOMS; i++) {
            if (ids[i] === 0n) return i;
        }
        return -1;
    }
};
