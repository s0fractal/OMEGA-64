// OMEGA-64 | assembly/index.ts | Zero-Allocation WASM VM Core

@external("env", "trace_atom")
declare function trace_atom(idx: i32, opcode: i32, gx: i32, gy: i32, targetIdx: i32): void;

// EXACT UNIFIED OFFSETS
const MAX_ATOMS: i32 = 100000;
const SAFETY_BUFFER: usize = 1000000;
const IDS_OFFSET: usize = SAFETY_BUFFER + 0;
const XS_OFFSET: usize = SAFETY_BUFFER + 800000;
const YS_OFFSET: usize = SAFETY_BUFFER + 1000000;
const ENERGY_OFFSET: usize = SAFETY_BUFFER + 1200000;
const RESONANCE_OFFSET: usize = SAFETY_BUFFER + 1600000;
const PHASE_OFFSET: usize = SAFETY_BUFFER + 2000000;
const LOGIC_OFFSET: usize = SAFETY_BUFFER + 2400000;
const BONDS_OFFSET: usize = SAFETY_BUFFER + 3200000;
const STIFFNESS_OFFSET: usize = SAFETY_BUFFER + 4800000;
const BOND_REQUESTS_OFFSET: usize = SAFETY_BUFFER + 18800000;
const SPATIAL_GRID_OFFSET: usize = SAFETY_BUFFER + 20000000;

const ISA_BIND: u8 = 0x40;
const ISA_SHARE: u8 = 0x41;
const ISA_SIGNAL: u8 = 0x42;
const ISA_READ_MATRIX: u8 = 0x43;
const ISA_INJECT: u8 = 0x44;
const ISA_BROADCAST: u8 = 0x45;
const ISA_ANNEX: u8 = 0x46;
const ISA_MUTATE: u8 = 0x47;
const ISA_RESONATE: u8 = 0x48;
const ISA_SENSE: u8 = 0x49;        // Atom senses global neural coherence field
const ISA_ASCEND: u8 = 0xFF;

// Crystal type constants
const CRYSTAL_OSCILLATOR: i32 = 5;

// Phase 19: Planetary Consciousness
// Global coherence broadcast channel — written by SOVEREIGN_ORACLE, read by ISA_SENSE
const NEURAL_COHERENCE_OFF: usize = SAFETY_BUFFER + 36000000;

// Phase 20: Self-Replication
// SPAWN_GRID: ring-buffer of pending child-atom requests written by ISA_REPLICATE,
// read and materialized by PULSE.ts in JS space. Each slot = 16 bytes:
//   [0..7]  parent genome (u64)
//   [8..9]  spawn x (i16)
//   [10..11] spawn y (i16)
//   [12..15] parent energy / 2 (i32)
const ISA_REPLICATE: u8 = 0x4A;
const SPAWN_GRID_OFF: usize = SAFETY_BUFFER + 37000000;
const SPAWN_MAX: i32 = 1024;    // ring-buffer capacity
const SPAWN_SLOT: i32 = 16;     // bytes per spawn request
// Atomic write-head lives at SPAWN_GRID_OFF
const SPAWN_HEAD_OFF: usize = SPAWN_GRID_OFF;
// Spawn data starts after 8-byte header
const SPAWN_DATA_OFF: usize = SPAWN_GRID_OFF + 8;

// Colony / Territory constants
const CRYSTAL_COLONY: i32 = 3;
const COLONY_THRESHOLD: i32 = 5;
const DECAY_COUNTER_OFF: usize = SAFETY_BUFFER + 35000000; // Decay tick counters

// Memetic Horizontal Transfer constants
const MEMORY_GRID_OFF: usize = SAFETY_BUFFER + 33000000;
const CRYSTAL_MEME: i32 = 10;       // Type for memetic nodes
const MEME_TRANSFER_PROB: i32 = 8;  // ~12.5% chance per tick for meme absorption

const STRUCTURE_GRID_OFF: usize = SAFETY_BUFFER + 31000000;
const SIGNAL_GRID_OFF: usize    = SAFETY_BUFFER + 32000000;
const ASCENSION_STATS_OFF: usize = SAFETY_BUFFER + 34000000;
const MAX_ASCENSIONS: i32 = 64;

@inline function getEnergy(idx: i32): i32 { return load<i32>(ENERGY_OFFSET + (idx << 2) as usize); }
@inline function setEnergy(idx: i32, val: i32): void { store<i32>(ENERGY_OFFSET + (idx << 2) as usize, val); }
@inline function getResonance(idx: i32): i32 { return load<i32>(RESONANCE_OFFSET + (idx << 2) as usize); }
@inline function setResonance(idx: i32, val: i32): void { store<i32>(RESONANCE_OFFSET + (idx << 2) as usize, val); }
@inline function getPhase(idx: i32): i32 { return load<i32>(PHASE_OFFSET + (idx << 2) as usize); }
@inline function setPhase(idx: i32, val: i32): void { store<i32>(PHASE_OFFSET + (idx << 2) as usize, val); }
@inline function getX(idx: i32): i16 { return load<i16>(XS_OFFSET + (idx << 1) as usize); }
@inline function getY(idx: i32): i16 { return load<i16>(YS_OFFSET + (idx << 1) as usize); }
@inline function getLogicByte(idx: i32, slot: i32): u8 { return load<u8>(LOGIC_OFFSET + (idx << 3) + slot as usize); }
@inline function getBondTarget(atomIdx: i32, slot: i32): i32 { return load<i32>(BONDS_OFFSET + (atomIdx << 4) + (slot << 2) as usize); }
@inline function setBondTarget(atomIdx: i32, slot: i32, targetIdx: i32): void { store<i32>(BONDS_OFFSET + (atomIdx << 4) + (slot << 2) as usize, targetIdx); }
@inline function getBondStiffness(atomIdx: i32, slot: i32): f32 { return load<f32>(STIFFNESS_OFFSET + (atomIdx << 4) + (slot << 2) as usize); }
@inline function setBondStiffness(atomIdx: i32, slot: i32, val: f32): void { store<f32>(STIFFNESS_OFFSET + (atomIdx << 4) + (slot << 2) as usize, val); }

@inline function writeBondRequest(initiator: i32, target: i32): void { 
    let offset = BOND_REQUESTS_OFFSET + (initiator * 12); 
    store<i32>(offset as usize, initiator + 1); 
    store<i32>(offset + 4 as usize, target); 
}

@inline function getSpatialGridCount(gx: i32, gy: i32): i32 { 
    let cellIdx = gy * 140 + gx; 
    return load<i32>(SPATIAL_GRID_OFFSET + (cellIdx << 7) as usize); 
}
@inline function getSpatialGridAtom(gx: i32, gy: i32, subIdx: i32): i32 { 
    let cellIdx = gy * 140 + gx; 
    return load<i32>(SPATIAL_GRID_OFFSET + (cellIdx << 7) + ((subIdx + 1) << 2) as usize); 
}

@inline function fireSignal(atomIndex: i32): void {
    for (let b = 0; b < 4; b++) {
        let target = getBondTarget(atomIndex, b);
        if (target > 0 && target < MAX_ATOMS) {
            let st = getBondStiffness(atomIndex, b);
            let signalStrength = (150.0 * st) as i32; // Increased to ensure cascade
            setResonance(target, getResonance(target) + signalStrength);
        }
    }
}

const INSTRUCTIONS_OFFSET: usize = SAFETY_BUFFER + 6400000;
const CONTEXT_OFFSET: usize = SAFETY_BUFFER + 12800000;

// RISC-I Opcodes
const OP_NOP: u8 = 0x00;
const OP_SET: u8 = 0x01; // SET Reg, Imm8
const OP_GET: u8 = 0x02; // GET Reg, Prop
const OP_PUT: u8 = 0x03; // PUT Reg, Prop
const OP_ADD: u8 = 0x04; // ADD R1, R2
const OP_SUB: u8 = 0x05; // SUB R1, R2
const OP_JZ:  u8 = 0x10; // JZ Reg, RelAddr
const OP_JNZ: u8 = 0x11; // JNZ Reg, RelAddr
const OP_JMP: u8 = 0x12; // JMP RelAddr
const OP_REPLICATE: u8 = 0x80;
const OP_SIGNAL: u8 = 0x81;
const OP_BIND: u8 = 0x82;
const OP_SHARE: u8 = 0x83;

// Property IDs for GET/PUT
const PROP_ENERGY: u8 = 0;
const PROP_RESONANCE: u8 = 1;
const PROP_X: u8 = 2;
const PROP_Y: u8 = 3;
const PROP_PHASE: u8 = 4;

@inline function getReg(atomIdx: i32, reg: i32): i32 {
    return load<i32>(CONTEXT_OFFSET + (atomIdx << 6) + (reg << 2) as usize);
}
@inline function setReg(atomIdx: i32, reg: i32, val: i32): void {
    store<i32>(CONTEXT_OFFSET + (atomIdx << 6) + (reg << 2) as usize, val);
}
@inline function getPC(atomIdx: i32): u8 {
    return load<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 32 as usize);
}
@inline function setPC(atomIdx: i32, val: u8): void {
    store<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 32 as usize, val);
}

export function execute_atom(atomIndex: i32): void {
    let pc = getPC(atomIndex);
    let energy = getEnergy(atomIndex);
    let resonance = getResonance(atomIndex);
    const instr_base: usize = INSTRUCTIONS_OFFSET + (atomIndex << 6) as usize;
    
    // Safety: 16 instructions per tick max to prevent infinite loops
    let step: i32 = 0;
    for (; step < 16; step++) {
        const op = load<u8>(instr_base + (pc as usize));
        if (op == OP_NOP) break;

        switch (op) {
            case OP_SET: {
                let reg = load<u8>(instr_base + (pc + 1) as usize);
                let imm = load<u8>(instr_base + (pc + 2) as usize);
                setReg(atomIndex, reg as i32, imm as i32);
                pc += 3;
                break;
            }
            case OP_GET: {
                let reg = load<u8>(instr_base + (pc + 1) as usize);
                let prop = load<u8>(instr_base + (pc + 2) as usize);
                let val: i32 = 0;
                if (prop == PROP_ENERGY) val = energy;
                else if (prop == PROP_RESONANCE) val = resonance;
                else if (prop == PROP_X) val = getX(atomIndex) as i32;
                else if (prop == PROP_Y) val = getY(atomIndex) as i32;
                else if (prop == PROP_PHASE) val = getPhase(atomIndex);
                setReg(atomIndex, reg as i32, val);
                pc += 3;
                break;
            }
            case OP_PUT: {
                let reg = load<u8>(instr_base + (pc + 1) as usize);
                let prop = load<u8>(instr_base + (pc + 2) as usize);
                let val = getReg(atomIndex, reg as i32);
                if (prop == PROP_ENERGY) energy = val;
                else if (prop == PROP_RESONANCE) resonance = val;
                else if (prop == PROP_PHASE) setPhase(atomIndex, val);
                pc += 3;
                break;
            }
            case OP_ADD: {
                let r1 = load<u8>(instr_base + (pc + 1) as usize);
                let r2 = load<u8>(instr_base + (pc + 2) as usize);
                setReg(atomIndex, r1 as i32, getReg(atomIndex, r1 as i32) + getReg(atomIndex, r2 as i32));
                pc += 3;
                break;
            }
            case OP_SUB: {
                let r1 = load<u8>(instr_base + (pc + 1) as usize);
                let r2 = load<u8>(instr_base + (pc + 2) as usize);
                setReg(atomIndex, r1 as i32, getReg(atomIndex, r1 as i32) - getReg(atomIndex, r2 as i32));
                pc += 3;
                break;
            }
            case OP_JNZ: {
                let reg = load<u8>(instr_base + (pc + 1) as usize);
                let target = load<u8>(instr_base + (pc + 2) as usize);
                if (getReg(atomIndex, reg as i32) != 0) pc = target;
                else pc += 3;
                break;
            }
            case OP_JMP: {
                pc = load<u8>(instr_base + (pc + 1) as usize);
                break;
            }
            case OP_REPLICATE: {
                // Kernel syscall: Replicate if possible
                if (energy > 1500 && resonance > 200) {
                    let rx = getX(atomIndex) as i32;
                    let ry = getY(atomIndex) as i32;
                    let gx = rx / 10;
                    let gy = ry / 10;
                    let spawnDx: i32 = (resonance % 3) - 1;
                    let spawnDy: i32 = ((resonance * 7) % 3) - 1;
                    let childGx: i32 = gx + spawnDx;
                    let childGy: i32 = gy + spawnDy;
                    
                    if (childGx >= 0 && childGx < 140 && childGy >= 0 && childGy < 80) {
                        let slot = atomic.add<i32>(SPAWN_HEAD_OFF as usize, 1) % SPAWN_MAX;
                        let slotOff: usize = SPAWN_DATA_OFF + (slot * SPAWN_SLOT) as usize;
                        let parentGenome = load<u64>((LOGIC_OFFSET + (atomIndex << 3) as usize) as usize);
                        store<u64>(slotOff, parentGenome);
                        store<i16>((slotOff + 8) as usize, childGx as i16);
                        store<i16>((slotOff + 10) as usize, childGy as i16);
                        store<i32>((slotOff + 12) as usize, energy >> 1);
                        energy = energy >> 1;
                        resonance = resonance + 30;
                    }
                }
                pc += 1;
                break;
            }
            case OP_SIGNAL: {
                fireSignal(atomIndex);
                pc += 1;
                break;
            }
            default: {
                pc = 0; // Reset or stop
                step = 16;
                break;
            }
        }
        if (pc >= 64) pc = 0;
    }
    setPC(atomIndex, pc);

    // --- Phase 23: Entropy Flux (Metabolism) ---
    // step is the number of instructions executed (0 to 16)
    let metabolicCost = 1 + (step >> 1); // 1 to 9 energy units per tick
    
    // Auto-Firing Action Potential
    if (resonance > 300) {
        if (energy > 200) {
            energy -= 200; // Firing has a systemic price
            setResonance(atomIndex, 0);
            setPhase(atomIndex, 5);
            fireSignal(atomIndex);
        } else {
            // Failure to fire due to low energy (stasis)
            setResonance(atomIndex, 280); 
        }
    }

    // Passive Decay (Resonance)
    if (resonance > 0) setResonance(atomIndex, resonance - 2);
    
    // Apply metabolic tax
    setEnergy(atomIndex, energy > metabolicCost ? energy - metabolicCost : 0);
}

// --- Phase 13: Crystalline Matrix Neural Engine ---

export function tick_matrix(): void {
    const GRID_COLS = 140;
    const GRID_ROWS = 80;

    for (let cy = 0; cy < GRID_ROWS; cy++) {
        for (let cx = 0; cx < GRID_COLS; cx++) {
            const i = cy * GRID_COLS + cx;
            const type = atomic.load<i32>(STRUCTURE_GRID_OFF + (i << 2));
            if (type == 0) continue;

            let currentRes = atomic.load<i32>(SIGNAL_GRID_OFF + (i << 2));
            
            // neighbor index offsets: Up, Down, Left, Right
            const nUp = (cy > 0) ? (cy - 1) * GRID_COLS + cx : -1;
            const nDown = (cy < GRID_ROWS - 1) ? (cy + 1) * GRID_COLS + cx : -1;
            const nLeft = (cx > 0) ? cy * GRID_COLS + (cx - 1) : -1;
            const nRight = (cx < GRID_COLS - 1) ? cy * GRID_COLS + (cx + 1) : -1;

            const neighbors = [nUp, nDown, nLeft, nRight];

            for (let n = 0; n < 4; n++) {
                const ni = neighbors[n];
                if (ni == -1) continue;
                
                const neighborType = atomic.load<i32>(STRUCTURE_GRID_OFF + (ni << 2));
                if (neighborType > 0) {
                    const neighborRes = atomic.load<i32>(SIGNAL_GRID_OFF + (ni << 2));
                    if (neighborRes > currentRes) {
                        // Conductive Flux (40% transmission)
                        const flux = ((neighborRes - currentRes) * 4) / 10;
                        currentRes += flux;
                    }
                }
            }

            // Phase 18: Oscillation Detection — convergent signal from 3+ neighbors
            // sustains and amplifies the wave, encoding memory in memoryGrid amplitude
            let converging: i32 = 0;
            for (let n = 0; n < 4; n++) {
                const nni = neighbors[n];
                if (nni == -1) continue;
                const nnType = atomic.load<i32>(STRUCTURE_GRID_OFF + (nni << 2));
                if (nnType > 0) {
                    const nnRes = atomic.load<i32>(SIGNAL_GRID_OFF + (nni << 2));
                    // Convergent if neighbor has signal flowing toward us
                    if (nnRes > currentRes) converging++;
                }
            }

            if (converging >= 3) {
                // Standing wave detected: amplify current signal
                currentRes += 50;
                // Mark as oscillator crystal
                if (type == 1) {
                    atomic.store<i32>(STRUCTURE_GRID_OFF + (i << 2), CRYSTAL_OSCILLATOR);
                }
                // Accumulate amplitude in memoryGrid (persistent standing wave memory)
                let mOff: usize = MEMORY_GRID_OFF + (i << 3) as usize;
                let prevAmp = load<u32>(mOff as usize);
                let newAmp = prevAmp + 1 > 65535 ? 65535 : prevAmp + 1;
                store<u32>(mOff as usize, newAmp);
            }

            // Logic Gate Processing
            if (type > 5) {
                // Threshold gate (type 6)
                if (currentRes < 200) currentRes = 0;
            }

            // Passive Decay & Persistence
            currentRes = currentRes > 5 ? currentRes - 5 : 0;

            atomic.store<i32>(SIGNAL_GRID_OFF + (i << 2), currentRes);
        }
    }
}

// --- Phase 19: Planetary Consciousness Exports ---

// SOVEREIGN_ORACLE calls this every N ticks to measure global mind-field strength
export function get_neural_coherence(): i32 {
    const GRID_CELLS = 140 * 80;
    let totalAmplitude: i32 = 0;
    let oscillatorCount: i32 = 0;

    for (let i = 0; i < GRID_CELLS; i++) {
        const cType = atomic.load<i32>(STRUCTURE_GRID_OFF + (i << 2));
        if (cType == CRYSTAL_OSCILLATOR) {
            // Read amplitude counter from memoryGrid (low 32 bits)
            const ampOff: usize = MEMORY_GRID_OFF + (i << 3) as usize;
            const amp = load<u32>(ampOff as usize);
            totalAmplitude += amp as i32;
            oscillatorCount++;
        }
    }

    // Coherence = average amplitude across all oscillators (capped at 2000)
    if (oscillatorCount == 0) return 0;
    let coherence = totalAmplitude / oscillatorCount;
    return coherence > 2000 ? 2000 : coherence;
}

// SOVEREIGN_ORACLE writes computed coherence back to shared broadcast channel
export function set_neural_coherence(value: i32): void {
    atomic.store<i32>(NEURAL_COHERENCE_OFF as usize, value);
}
