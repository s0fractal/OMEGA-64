// OMEGA-64 | STATE_MATRIX.ts | Era 68: Absolute Coherence
import * as OFFSETS from "./OFFSETS.ts";

export const MAX_ATOMS = OFFSETS.MAX_ATOMS;
export const SCALE = OFFSETS.SCALE;

// Base Buffers for UI/WASM compatibility
export const wasmMemory = new WebAssembly.Memory({ initial: 1024, maximum: 1024, shared: true });
export const sharedBuffer = wasmMemory.buffer as SharedArrayBuffer;

// Expose underlying buffers for UI export
export const idBuffer = new BigUint64Array(sharedBuffer, OFFSETS.IDS_OFFSET, MAX_ATOMS).buffer;
export const xBuffer = new Int16Array(sharedBuffer, OFFSETS.XS_OFFSET, MAX_ATOMS).buffer;
export const yBuffer = new Int16Array(sharedBuffer, OFFSETS.YS_OFFSET, MAX_ATOMS).buffer;
export const energyBuffer = new Int32Array(sharedBuffer, OFFSETS.ENERGY_OFFSET, MAX_ATOMS).buffer;
export const resonanceBuffer = new Int32Array(sharedBuffer, OFFSETS.RESONANCE_OFFSET, MAX_ATOMS).buffer;
export const phaseBuffer = new Int32Array(sharedBuffer, OFFSETS.PHASE_OFFSET, MAX_ATOMS).buffer;
export const logicBuffer = new Uint8Array(sharedBuffer, OFFSETS.LOGIC_OFFSET, MAX_ATOMS * 8).buffer;
export const bondBuffer = new Uint32Array(sharedBuffer, OFFSETS.BONDS_OFFSET, MAX_ATOMS * 4).buffer;
export const stiffnessBuffer = new Float32Array(sharedBuffer, OFFSETS.STIFFNESS_OFFSET, MAX_ATOMS * 4).buffer;
export const roleBuffer = new Uint8Array(sharedBuffer, OFFSETS.ROLES_OFFSET, MAX_ATOMS).buffer;
export const memoryGridBuffer = new Uint8Array(sharedBuffer, OFFSETS.MEMORY_GRID_OFFSET, 140 * 80 * 8).buffer;
export const signalGridBuffer = new Int32Array(sharedBuffer, OFFSETS.SIGNAL_GRID_OFFSET, 140 * 80).buffer;
export const structureGridBuffer = new Int32Array(sharedBuffer, OFFSETS.STRUCTURE_GRID_OFFSET, 140 * 80).buffer;

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
const structureGrid = new Int32Array(sharedBuffer, OFFSETS.STRUCTURE_GRID_OFFSET, 140 * 80);
const signalGrid = new Int32Array(sharedBuffer, OFFSETS.SIGNAL_GRID_OFFSET, 140 * 80);
const memoryGrid = new Uint8Array(sharedBuffer, OFFSETS.MEMORY_GRID_OFFSET, 140 * 80 * 8);

const instructions = new Uint8Array(sharedBuffer, OFFSETS.INSTRUCTIONS_OFFSET, MAX_ATOMS * 64);
const contexts = new Int32Array(sharedBuffer, OFFSETS.CONTEXT_OFFSET, MAX_ATOMS * 16); // 16 * 4 = 64 bytes

// Coordination Views (Atomic)
const syncState = new Int32Array(sharedBuffer, OFFSETS.SYNC_STATE_OFFSET, 1);
const tickCounter = new Int32Array(sharedBuffer, OFFSETS.TICK_COUNTER_OFFSET, 1);

export const SYNC = {
    IDLE: 0,
    WASM_TICKING: 1,
    HOST_LOCK: 2
};

export const RISC = {
    OP_NOP: 0x00,
    OP_SET: 0x01,
    OP_GET: 0x02,
    OP_PUT: 0x03,
    OP_ADD: 0x04,
    OP_SUB: 0x05,
    OP_JZ:  0x10,
    OP_JNZ: 0x11,
    OP_JMP: 0x12,
    OP_REPLICATE: 0x80,
    OP_SIGNAL: 0x81,
    OP_BIND: 0x82,
    OP_SHARE: 0x83,

    PROP_ENERGY: 0,
    PROP_RESONANCE: 1,
    PROP_X: 2,
    PROP_Y: 3,
    PROP_PHASE: 4,
};

export const STATE_MATRIX = {
    MAX_ATOMS,
    buffer: sharedBuffer,
    wasmMemory,
    SCALE,
    syncState,
    tickCounter,
    SYNC,
    phases,
    roles,
    spatialGrid,
    structureGrid,
    signalGrid,
    memoryGrid,
    instructions,
    contexts,
    RISC,
    
    // Legacy mapping for UI and external engines
    memoryGridBuffer,
    signalGridBuffer,
    structureGridBuffer,
    roleRegistryBuffer: roleBuffer,
    bondStiffnessBuffer: stiffnessBuffer,
    immuneBuffer: signalGridBuffer, // Alias for immunity overlay
    currentReadBuffer: signalGridBuffer, // Alias for signal overlay
    synapticStackBuffer: signalGridBuffer, // Alias for synaptic overlay
    
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
    
    getInstructions: (i: number) => instructions.subarray(i * 64, i * 64 + 64),
    getReg: (i: number, reg: number) => Atomics.load(contexts, i * 16 + reg),
    getPC: (i: number) => Atomics.load(new Uint8Array(sharedBuffer, OFFSETS.CONTEXT_OFFSET + i * 64 + 32, 1), 0),

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

    setInstructions: (i: number, val: Uint8Array) => instructions.set(val, i * 64),
    setReg: (i: number, reg: number, val: number) => Atomics.store(contexts, i * 16 + reg, val),
    setPC: (i: number, val: number) => Atomics.store(new Uint8Array(sharedBuffer, OFFSETS.CONTEXT_OFFSET + i * 64 + 32, 1), 0, val),

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
    findEmptySlot: (): number => {
        for (let i = 0; i < MAX_ATOMS; i++) {
            if (Atomics.load(ids, i) === 0n) return i;
        }
        return -1;
    },

    seedAtom: (i: number, id: bigint, x: number, y: number, energy: number, resonance: number, logicVal?: Uint8Array, script?: Uint8Array) => {
        Atomics.store(ids, i, id);
        Atomics.store(xs, i, Math.round(x));
        Atomics.store(ys, i, Math.round(y));
        Atomics.store(energies, i, Math.round(energy * SCALE));
        Atomics.store(resonances, i, resonance);
        Atomics.store(phases, i, 0);
        Atomics.store(roles, i, 0);
        
        if (logicVal) logic.set(logicVal, i * 8);

        const boot = script || new Uint8Array(64);
        if (!script) {
            // Default Biological Script: GET Energy into R0
            boot[0] = RISC.OP_GET; boot[1] = 0; boot[2] = RISC.PROP_ENERGY;
        }
        instructions.set(boot, i * 64);
        
        // Reset Context
        for (let r = 0; r < 16; r++) Atomics.store(contexts, i * 16 + r, 0);
        // PC is at offset 32 (Reg index 8)
        Atomics.store(new Uint8Array(sharedBuffer, OFFSETS.CONTEXT_OFFSET + i * 64 + 32, 1), 0, 0);
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
    },

    injectEnergy: (amount: number) => {
        let count = 0;
        for (let i = 0; i < MAX_ATOMS; i++) {
            if (Atomics.load(ids, i) !== 0n) {
                const current = Atomics.load(energies, i);
                Atomics.store(energies, i, current + Math.round(amount * SCALE));
                count++;
            }
        }
        return count;
    }
};
