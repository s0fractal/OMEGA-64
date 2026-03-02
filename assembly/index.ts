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
const ISA_READ_MATRIX: u8 = 0x43;  // Read local crystal signal → resonance
const ISA_INJECT: u8 = 0x44;       // Inject surplus resonance → crystal signal
const ISA_BROADCAST: u8 = 0x45;    // Stamp genome hash into memoryGrid (colony beacon)
const ISA_ASCEND: u8 = 0xFF;

// Colony constants
const CRYSTAL_COLONY: i32 = 3;     // Structure type for collective crystallization
const COLONY_THRESHOLD: i32 = 5;   // Min colony markers to trigger crystallization

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

export function execute_atom(atomIndex: i32): void {
    let energy = getEnergy(atomIndex);
    let resonance = getResonance(atomIndex);
    let phase = getPhase(atomIndex);
    let x = getX(atomIndex);
    let y = getY(atomIndex);
    let gx = (x as i32) / 10;
    let gy = (y as i32) / 10;
    
    const opcode = getLogicByte(atomIndex, 0);

    // --- Phase 9: Neural Processing ---
    if (phase > 0) {
        setPhase(atomIndex, phase - 1);
    } else {
        if (opcode == ISA_SIGNAL) {
            fireSignal(atomIndex);
            setPhase(atomIndex, 3); // Shorter refractory for tests
            trace_atom(atomIndex, opcode as i32, x as i32, y as i32, 1);
        }
    }

    // Temporal Summation / Action Potential
    if (resonance > 300) { // Lowered threshold for test
        energy += 50; 
        resonance = 0; // Absolute reset after firing
        setResonance(atomIndex, resonance);
        setPhase(atomIndex, 5); // Recovery period
        fireSignal(atomIndex); // CASCADING SIGNAL
        trace_atom(atomIndex, 0x99, x as i32, y as i32, energy); 
    }

    // --- Phase 8: Synaptic & Metabolic Logic ---
    if (opcode == ISA_BIND) {
        let nearestIdx: i32 = -1;
        let minDistSq: i32 = 10000; 
        for (let ox = -5; ox <= 5; ox++) {
            for (let oy = -5; oy <= 5; oy++) {
                let nx = gx + ox;
                let ny = gy + oy;
                if (nx >= 0 && nx < 140 && ny >= 0 && ny < 80) {
                    let count = getSpatialGridCount(nx, ny);
                    for (let c = 0; c < count; c++) {
                        let otherIdx = getSpatialGridAtom(nx, ny, c);
                        if (otherIdx != atomIndex && otherIdx >= 0) {
                            let dx = (getX(otherIdx) - x) as i32;
                            let dy = (getY(otherIdx) - y) as i32;
                            let dSq = dx * dx + dy * dy;
                            if (dSq < minDistSq) {
                                minDistSq = dSq;
                                nearestIdx = otherIdx;
                            }
                        }
                    }
                }
            }
        }
        if (nearestIdx != -1) writeBondRequest(atomIndex, nearestIdx);
    } else if (opcode == ISA_SHARE) {
        for (let b = 0; b < 4; b++) {
            let target = getBondTarget(atomIndex, b);
            if (target > 0 && target < MAX_ATOMS) {
                let stiffness = getBondStiffness(atomIndex, b);
                let share = (energy / 10);
                energy -= share;
                setEnergy(target, getEnergy(target) + share);
                if (stiffness < 1.0) setBondStiffness(atomIndex, b, stiffness + 0.05);
                break; 
            }
        }
    } else if (opcode == ISA_ASCEND) {
        if (energy > 500) {
            // Atomic Governor Pattern: Atomically increment and check old value
            let old = atomic.add<i32>(ASCENSION_STATS_OFF, 1);
            if (old < MAX_ASCENSIONS) {
                // Perform Ascension
                let cellIdx = gy * 140 + gx;
                atomic.store<i32>(STRUCTURE_GRID_OFF + (cellIdx << 2), 1); // Mark as crystal
                energy = 0; // Consumption
                store<u64>(IDS_OFFSET + (atomIndex << 3), 0); // Deactivate atom
            } else {
                // Throttled: Rollback increment
                atomic.sub<i32>(ASCENSION_STATS_OFF, 1);
            }
        }

    // --- Phase 14: Bio-Matrix Coupling ---

    } else if (opcode == ISA_READ_MATRIX) {
        // Read local crystal signal into atom's resonance
        let cellIdx = gy * 140 + gx;
        let crystalType = atomic.load<i32>(STRUCTURE_GRID_OFF + (cellIdx << 2));
        if (crystalType > 0) {
            let localSignal = atomic.load<i32>(SIGNAL_GRID_OFF + (cellIdx << 2));
            // Attune: add a fraction of local signal to own resonance
            let attunement = localSignal >> 2; // 25% absorption
            setResonance(atomIndex, resonance + attunement);
        }

    } else if (opcode == ISA_INJECT) {
        // Inject surplus resonance into the crystal at this position
        if (resonance > 200) {
            let cellIdx = gy * 140 + gx;
            let crystalType = atomic.load<i32>(STRUCTURE_GRID_OFF + (cellIdx << 2));
            if (crystalType > 0) {
                // Inject half of surplus resonance into signal grid
                let injection = resonance >> 1;
                atomic.add<i32>(SIGNAL_GRID_OFF + (cellIdx << 2), injection);
                setResonance(atomIndex, resonance - injection);
            }
        }

    } else if (opcode == ISA_BROADCAST) {
        // --- Phase 15: Colony Broadcast ---
        // Compute a 4-byte genome hash from this atom's logic bytes
        let l0 = load<u32>(LOGIC_OFFSET + (atomIndex << 3) as usize);
        let cellIdx = gy * 140 + gx;
        let memeOff: usize = MEMORY_GRID_OFF + (cellIdx << 3) as usize;

        // Read existing colony counter from upper 4 bytes of meme slot
        let existing = load<u64>(memeOff);
        let sameGenome = ((existing & 0xFFFFFFFF) as u32) == l0;
        let count = sameGenome ? ((existing >> 32) as i32) + 1 : 1;

        // Write genome hash + count back
        store<u64>(memeOff, (l0 as u64) | ((count as u64) << 32));

        // Collective crystallization: enough tribe members → become CRYSTAL_COLONY
        if (count >= COLONY_THRESHOLD) {
            let structType = atomic.load<i32>(STRUCTURE_GRID_OFF + (cellIdx << 2));
            if (structType == 0) {
                atomic.store<i32>(STRUCTURE_GRID_OFF + (cellIdx << 2), CRYSTAL_COLONY);
                atomic.store<i32>(SIGNAL_GRID_OFF + (cellIdx << 2), 500); // Seed colony resonance
            }
        }
        // Boost own resonance slightly for broadcasting
        setResonance(atomIndex, resonance + 10);
    }

    // --- Memetic Horizontal Transfer ---
    // If standing on a CRYSTAL_MEME, stochastically absorb the stored genome
    {
        let cellIdx = gy * 140 + gx;
        let crystalType = atomic.load<i32>(STRUCTURE_GRID_OFF + (cellIdx << 2));
        if (crystalType == CRYSTAL_MEME) {
            // Simple stochastic gate using atomIndex as entropy source
            let dice = (atomIndex * 2654435769 + resonance) & 0x7FFFFFFF;
            if ((dice % MEME_TRANSFER_PROB) == 0) {
                // Absorb the stored 8-byte meme genome into atom's logic
                let memeOff: usize = MEMORY_GRID_OFF + (cellIdx << 3) as usize;
                let meme = load<u64>(memeOff);
                if (meme != 0) {
                    // Overwrite first 4 bytes of logic with meme bytes
                    store<u32>(LOGIC_OFFSET + (atomIndex << 3) as usize, (meme & 0xFFFFFFFF) as u32);
                }
            }
        }
    }

    // Passive Metabolism & Hebbian Decay
    for (let b = 0; b < 4; b++) {
        let target = getBondTarget(atomIndex, b);
        if (target > 0 && target < MAX_ATOMS) {
            let stiffness = getBondStiffness(atomIndex, b);
            let targetE = getEnergy(target);
            let diff = targetE - energy;
            if (diff != 0) {
                let flux = ((diff as f32) * (stiffness * 0.1)) as i32;
                energy += flux;
                setEnergy(target, targetE - flux);
            }
            if (stiffness > 0.01) setBondStiffness(atomIndex, b, stiffness - 0.001);
            else { setBondTarget(atomIndex, b, 0); setBondStiffness(atomIndex, b, 0); }
        }
    }

    // Resonance Decay (Leaky Integrator)
    if (resonance > 0) setResonance(atomIndex, resonance - 3);
    else if (resonance < 0) setResonance(atomIndex, 0);

    setEnergy(atomIndex, energy - 1);
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

            // Logic Gate Processing (Experimental)
            if (type > 5) {
                // Threshold gate
                if (currentRes < 200) currentRes = 0;
            }

            // Passive Decay & Persistence
            currentRes = currentRes > 5 ? currentRes - 5 : 0;
            
            atomic.store<i32>(SIGNAL_GRID_OFF + (i << 2), currentRes);
        }
    }
}
