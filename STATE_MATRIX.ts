// OMEGA-64 | STATE_MATRIX.ts | Era 8: The Structure-of-Arrays (SoA) Matrix
// High-performance memory layout for cache efficiency.

export const MAX_ATOMS = 100000;
export const ATOM_SIZE = 64; // Legacy constant for compatibility
export const GOD_ATOM_ID = 0xFFFFFFFFFFFFFFFFn;
export const GOD_ATOM_INDEX = 0;

// Memory offsets for SoA approach (Contiguous blocks per field)
const BUFFER_SIZE = 
    (MAX_ATOMS * 8) + // ids (BigUint64)
    (MAX_ATOMS * 2) * 2 + // xs, ys (Int16)
    (MAX_ATOMS * 4) * 3 + // energy, resonance, phase (Float32)
    (MAX_ATOMS * 8) + // logic (Uint8 x 8)
    (MAX_ATOMS * 4 * 4); // bonds (Uint32 x 4)

const buffer = new SharedArrayBuffer(BUFFER_SIZE);

// TypedArray Views (Structure of Arrays)
const IDS_OFFSET = 0;
const XS_OFFSET = IDS_OFFSET + (MAX_ATOMS * 8);
const YS_OFFSET = XS_OFFSET + (MAX_ATOMS * 2);
const ENERGY_OFFSET = YS_OFFSET + (MAX_ATOMS * 2);
const RESONANCE_OFFSET = ENERGY_OFFSET + (MAX_ATOMS * 4);
const PHASE_OFFSET = RESONANCE_OFFSET + (MAX_ATOMS * 4);
const LOGIC_OFFSET = PHASE_OFFSET + (MAX_ATOMS * 4);
const BONDS_OFFSET = LOGIC_OFFSET + (MAX_ATOMS * 8);

const ids = new BigUint64Array(buffer, IDS_OFFSET, MAX_ATOMS);
const xs = new Int16Array(buffer, XS_OFFSET, MAX_ATOMS);
const ys = new Int16Array(buffer, YS_OFFSET, MAX_ATOMS);
const energies = new Float32Array(buffer, ENERGY_OFFSET, MAX_ATOMS);
const resonances = new Float32Array(buffer, RESONANCE_OFFSET, MAX_ATOMS);
const phases = new Float32Array(buffer, PHASE_OFFSET, MAX_ATOMS);
const logic = new Uint8Array(buffer, LOGIC_OFFSET, MAX_ATOMS * 8);
const bonds = new Uint32Array(buffer, BONDS_OFFSET, MAX_ATOMS * 4);

export const STATE_MATRIX = {
    MAX_ATOMS,
    buffer,
    
    // --- ID ---
    getId: (idx: number) => ids[idx],
    setId: (idx: number, id: bigint) => { ids[idx] = id; },

    // --- POSITIONS ---
    getX: (idx: number) => xs[idx],
    setX: (idx: number, val: number) => { xs[idx] = val; },
    getY: (idx: number) => ys[idx],
    setY: (idx: number, val: number) => { ys[idx] = val; },

    // --- METRICS ---
    getEnergy: (idx: number) => energies[idx],
    setEnergy: (idx: number, val: number) => { energies[idx] = val; },
    getResonance: (idx: number) => resonances[idx],
    setResonance: (idx: number, val: number) => { resonances[idx] = val; },
    getPhase: (idx: number) => phases[idx],
    setPhase: (idx: number, val: number) => { phases[idx] = val; },

    // --- GENOME (Logic) ---
    getLogic: (idx: number) => logic.subarray(idx * 8, idx * 8 + 8),
    setLogic: (idx: number, bytes: Uint8Array) => {
        logic.set(bytes.subarray(0, 8), idx * 8);
    },

    // --- BONDS ---
    getBonds: (idx: number) => bonds.subarray(idx * 4, idx * 4 + 4),
    setBonds: (idx: number, indices: Uint32Array) => {
        bonds.set(indices.subarray(0, 4), idx * 4);
    },

    // --- SYSTEM ---
    clear: (idx: number) => {
        ids[idx] = 0n;
        xs[idx] = 0;
        ys[idx] = 0;
        energies[idx] = 0;
        resonances[idx] = 0;
        phases[idx] = 0;
        logic.fill(0, idx * 8, idx * 8 + 8);
        bonds.fill(0, idx * 4, idx * 4 + 4);
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
