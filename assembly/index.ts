// OMEGA-64 | assembly/index.ts | Zero-Allocation WASM VM Core

// Flat memory offsets (MUST match STATE_MATRIX.ts exactly)
const MAX_ATOMS: i32 = 100000;
const IDS_OFFSET: usize = 0;
const XS_OFFSET: usize = IDS_OFFSET + (<usize>MAX_ATOMS * 8);
const YS_OFFSET: usize = XS_OFFSET + (<usize>MAX_ATOMS * 2);
const ENERGY_OFFSET: usize = YS_OFFSET + (<usize>MAX_ATOMS * 2);
const RESONANCE_OFFSET: usize = ENERGY_OFFSET + (<usize>MAX_ATOMS * 4);
const PHASE_OFFSET: usize = RESONANCE_OFFSET + (<usize>MAX_ATOMS * 4);
const LOGIC_OFFSET: usize = PHASE_OFFSET + (<usize>MAX_ATOMS * 4);
const BONDS_OFFSET: usize = LOGIC_OFFSET + (<usize>MAX_ATOMS * 8);
const INSTRUCTIONS_OFFSET: usize = BONDS_OFFSET + (<usize>MAX_ATOMS * 16);
const CONTEXT_OFFSET: usize = INSTRUCTIONS_OFFSET + (<usize>MAX_ATOMS * 64);
const EVOLUTION_OFFSET: usize = CONTEXT_OFFSET + (<usize>MAX_ATOMS * 32);
const INTENT_OFFSET: usize = EVOLUTION_OFFSET;

// ISA Constants
const ISA_NOP: u8 = 0x00;
const ISA_MITOSIS: u8 = 0x08;
const ISA_JMP: u8 = 0x02;

// Intent Encoder helper
// Combines opcode + 3 args into a single u32 word for zero-allocation cross-ffi writing
@inline
function writeIntent(atomIdx: i32, opcode: u8, arg1: u8, arg2: u8, arg3: u8): void {
    let intent: u32 = (opcode as u32) | ((arg1 as u32) << 8) | ((arg2 as u32) << 16) | ((arg3 as u32) << 24);
    store<u32>(INTENT_OFFSET + (atomIdx << 2) as usize, intent);
}

// Atom Accessors
@inline
function getEnergy(idx: i32): i32 {
    return load<i32>(ENERGY_OFFSET + (idx << 2) as usize);
}

@inline
function setEnergy(idx: i32, val: i32): void {
    store<i32>(ENERGY_OFFSET + (idx << 2) as usize, val);
}

@inline
function getResonance(idx: i32): i32 {
    return load<i32>(RESONANCE_OFFSET + (idx << 2) as usize);
}

@inline
function setResonance(idx: i32, val: i32): void {
    store<i32>(RESONANCE_OFFSET + (idx << 2) as usize, val);
}

export function execute_atom(atomIndex: i32): void {
    // Basic test function to prove FFI isolation
    let energy = getEnergy(atomIndex);
    let resonance = getResonance(atomIndex);
    
    // Decrement energy minimally for living
    setEnergy(atomIndex, energy - 1);
    
    // Naturally grow resonance by 1 (0.001 per tick in float)
    // Needs to reach > 100 to be elected Regent
    setResonance(atomIndex, resonance + 1); 
    
    // If energy > 50000, queue mitosis (0x08 opcode for PULSE_WORKER to resolve later)
    if (energy > 50000) {
       writeIntent(atomIndex, ISA_MITOSIS, 0, 0, 0); 
    } else {
       // NOP intent
       writeIntent(atomIndex, ISA_NOP, 0, 0, 0);
    }
}

