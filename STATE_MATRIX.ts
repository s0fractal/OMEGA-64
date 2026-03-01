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
const marketBuffer = new SharedArrayBuffer(8); // Pool: [Total Bet] + Padding
const evolutionRequestsBuffer = new SharedArrayBuffer(MAX_ATOMS); // ERA 18
const spawnRequestsBuffer = new SharedArrayBuffer(MAX_ATOMS); // ERA 41
const viralGridBuffer = new SharedArrayBuffer(1400 * 800); // 1.12MB byte array for viral RNA + 1-byte intensity
const immuneBuffer = new SharedArrayBuffer(MAX_ATOMS); // ERA 26: Quarantine flags
const messageBufferA = new SharedArrayBuffer(MAX_ATOMS); // ERA 27: Atomic Signaling (Signal A)
const messageBufferB = new SharedArrayBuffer(MAX_ATOMS); // ERA 27: Atomic Signaling (Signal B)
const bondStiffnessBuffer = new SharedArrayBuffer(MAX_ATOMS * 4 * 4); // ERA 28: 4 floats per atom
const synapticStackBuffer = new SharedArrayBuffer(MAX_ATOMS * 4 * 4); // ERA 30: 4 Int32 slots per atom
const structureGridBuffer = new SharedArrayBuffer(70 * 40 * 4); // ERA 31: 70x40 grid of Int32 (Density/Type)
const memoryGridBuffer = new SharedArrayBuffer(70 * 40 * 8); // ERA 32: 70x40 grid of 8-byte bytecode (2x Int32)
const roleRegistryBuffer = new SharedArrayBuffer(MAX_ATOMS); // ERA 33: 1 byte per atom for Role
const semanticBonusesBuffer = new SharedArrayBuffer(MAX_ATOMS); // ERA 36: 1 bit-mask byte per atom
const senderSignatureBufferA = new SharedArrayBuffer(MAX_ATOMS * 8); // ERA 38: Sender identity for Signal A
const senderSignatureBufferB = new SharedArrayBuffer(MAX_ATOMS * 8); // ERA 38: Sender identity for Signal B

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
const spawnRequests = new Uint8Array(spawnRequestsBuffer); // ERA 41
const viralGrid = new Uint8Array(viralGridBuffer);
const quarantineFlags = new Uint8Array(immuneBuffer);
const messagesA = new Uint8Array(messageBufferA);
const messagesB = new Uint8Array(messageBufferB);
const bondStiffness = new Float32Array(bondStiffnessBuffer);
const synapticStack = new Int32Array(synapticStackBuffer);
const structureGrid = new Int32Array(structureGridBuffer);
const memoryGrid = new Uint8Array(memoryGridBuffer);
const roles = new Uint8Array(roleRegistryBuffer);
const semanticBonuses = new Uint8Array(semanticBonusesBuffer);
const senderSignaturesA = new Uint8Array(senderSignatureBufferA);
const senderSignaturesB = new Uint8Array(senderSignatureBufferB);

const SCALE = 1000;

export const STATE_MATRIX = {
    MAX_ATOMS,
    buffer,
    bondStiffnessBuffer,
    messageBufferA,
    messageBufferB,
    marketBuffer,
    SCALE,
    evolutionRequestsBuffer,
    spawnRequestsBuffer,
    viralGridBuffer,
    viralGrid,
    immuneBuffer,
    quarantineFlags,
    synapticStackBuffer,
    structureGridBuffer,
    structureGrid,
    memoryGridBuffer,
    memoryGrid,
    roleRegistryBuffer,
    roles,
    semanticBonusesBuffer,
    semanticBonuses,
    senderSignatureBufferA,
    senderSignatureBufferB,
    senderSignaturesA,
    senderSignaturesB,
    
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
    
    // --- MITOSIS (ERA 41) ---
    requestSpawn: (idx: number) => { Atomics.store(spawnRequests, idx, 1); },
    clearSpawn: (idx: number) => { Atomics.store(spawnRequests, idx, 0); },
    hasSpawnRequest: (idx: number) => Atomics.load(spawnRequests, idx) === 1,

    // --- IMMUNITY (ERA 26) ---
    setQuarantine: (idx: number, level: number) => { Atomics.store(quarantineFlags, idx, level); },
    getQuarantine: (idx: number) => Atomics.load(quarantineFlags, idx),
    // Levels: 0 = Healthy, 1 = Flagged (Visual), 2 = Suppressed (NO-OP)


    // --- MESSAGING (ERA 27: Collective Intelligence) ---
    // Dual-buffered to ensure determinism (Read pulse N, Write pulse N)
    // swap is handled at the start of PULSE.run() loop
    currentWriteBuffer: messagesA,
    currentReadBuffer: messagesB,
    currentWriteSignatures: senderSignaturesA,
    currentReadSignatures: senderSignaturesB,
    swapMessageBuffers: () => {
        const tempBuf = STATE_MATRIX.currentWriteBuffer;
        STATE_MATRIX.currentWriteBuffer = STATE_MATRIX.currentReadBuffer;
        STATE_MATRIX.currentReadBuffer = tempBuf;
        
        const tempSig = STATE_MATRIX.currentWriteSignatures;
        STATE_MATRIX.currentWriteSignatures = STATE_MATRIX.currentReadSignatures;
        STATE_MATRIX.currentReadSignatures = tempSig;

        // Clear the NEW write buffers
        STATE_MATRIX.currentWriteBuffer.fill(0);
        STATE_MATRIX.currentWriteSignatures.fill(0);
    },
    getMessage: (idx: number) => Atomics.load(STATE_MATRIX.currentReadBuffer, idx),
    setMessage: (idx: number, val: number) => { Atomics.store(STATE_MATRIX.currentWriteBuffer, idx, val & 0xFF); },


    // --- MORPHOGENESIS (ERA 28) ---
    getBondStiffness: (atomIdx: number, bondSlot: number) => bondStiffness[atomIdx * 4 + bondSlot],
    setBondStiffness: (atomIdx: number, bondSlot: number, val: number) => { 
        bondStiffness[atomIdx * 4 + bondSlot] = val; 
    },

    // --- SYNAPTIC STACK (ERA 30) ---
    getSynapticValue: (atomIdx: number, slot: number) => Atomics.load(synapticStack, atomIdx * 4 + slot),
    setSynapticValue: (atomIdx: number, slot: number, val: number) => {
        Atomics.store(synapticStack, atomIdx * 4 + slot, val);
    },


    // --- BONDS ---
    getBonds: (idx: number) => bonds.subarray(idx * 4, idx * 4 + 4),
    setBonds: (idx: number, indices: Uint32Array) => {
        bonds.set(indices.subarray(0, 4), idx * 4);
    },

    // --- SYSTEM ---
    clear: () => {
        new Uint32Array(buffer).fill(0);
        new Uint8Array(evolutionRequestsBuffer).fill(0);
        new Uint8Array(spawnRequestsBuffer).fill(0);
        new Uint8Array(viralGridBuffer).fill(0);
        new Uint8Array(immuneBuffer).fill(0);
        messagesA.fill(0);
        messagesB.fill(0);
        bondStiffness.fill(0);
        synapticStack.fill(0);
        structureGrid.fill(0);
        memoryGrid.fill(0);
        roles.fill(0);
        semanticBonuses.fill(0);
        senderSignaturesA.fill(0);
        senderSignaturesB.fill(0);
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
