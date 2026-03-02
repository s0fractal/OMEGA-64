// OMEGA-64 | assembly/index.ts | Zero-Allocation WASM VM Core

@external("env", "trace_atom")
declare function trace_atom(idx: i32, opcode: i32, gx: i32, gy: i32, targetIdx: i32): void;

// EXACT UNIFIED OFFSETS
const MAX_ATOMS: i32 = 100000;
const IDS_OFFSET: usize = 0;
const XS_OFFSET: usize = 800000;
const YS_OFFSET: usize = 1000000;
const ENERGY_OFFSET: usize = 1200000;
const RESONANCE_OFFSET: usize = 1600000;
const PHASE_OFFSET: usize = 2000000;
const LOGIC_OFFSET: usize = 2400000;
const BONDS_OFFSET: usize = 3200000;
const STIFFNESS_OFFSET: usize = 4800000;
const BOND_REQUESTS_OFFSET: usize = 18800000;
const SPATIAL_GRID_OFFSET: usize = 20000000;

const ISA_BIND: u8 = 0x40;
const ISA_SHARE: u8 = 0x41;
const ISA_SIGNAL: u8 = 0x42;

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
