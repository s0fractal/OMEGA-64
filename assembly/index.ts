// OMEGA-64 | assembly/index.ts | Zero-Allocation WASM VM Core

@external("env", "trace_atom")
declare function trace_atom(idx: i32, opcode: i32, gx: i32, gy: i32, targetIdx: i32): void;

const TRACE_THRESHOLD: u64 = 100; // Trace logic for atoms with ID < TRACE_THRESHOLD

// EXACT UNIFIED OFFSETS
const MAX_ATOMS: i32 = 100000;
const SAFETY_BUFFER: usize = 8000000;
const IDS_OFFSET: usize = SAFETY_BUFFER + 0;
const XS_OFFSET: usize = SAFETY_BUFFER + 800000;
const YS_OFFSET: usize = SAFETY_BUFFER + 1000000;
const ENERGY_OFFSET: usize = SAFETY_BUFFER + 1200000;
const RESONANCE_OFFSET: usize = SAFETY_BUFFER + 1600000;
const PHASE_OFFSET: usize = SAFETY_BUFFER + 2000000;
const LOGIC_OFFSET: usize = SAFETY_BUFFER + 2400000;
const BONDS_OFFSET: usize = SAFETY_BUFFER + 3200000;
const STIFFNESS_OFFSET: usize = SAFETY_BUFFER + 4800000;
const INSTRUCTIONS_OFFSET: usize = SAFETY_BUFFER + 6400000;
const CONTEXT_OFFSET: usize = SAFETY_BUFFER + 12800000;
const BOND_REQUESTS_OFFSET: usize = SAFETY_BUFFER + 22000000;
const SPATIAL_GRID_OFFSET: usize = SAFETY_BUFFER + 23200000;
const ROLES_OFFSET: usize = SAFETY_BUFFER + 33200000;
const STRUCTURE_GRID_OFF: usize = SAFETY_BUFFER + 34200000;
const SIGNAL_GRID_OFF: usize    = SAFETY_BUFFER + 35200000;
const DECAY_COUNTER_OFF: usize  = SAFETY_BUFFER + 35000000; // Keep separate if needed, but watch it
const MEMORY_GRID_OFF: usize    = SAFETY_BUFFER + 36200000;
const ASCENSION_STATS_OFF: usize = SAFETY_BUFFER + 37200000;
const BOND_DIST_OFF: usize   = SAFETY_BUFFER + 38200000;
const DAMPING_OFF: usize     = SAFETY_BUFFER + 39200000;
const HIVE_MEMORY_OFF: usize = SAFETY_BUFFER + 40200000;
const HIVE_BALANCE_OFF: usize = SAFETY_BUFFER + 40201024;
const QUORUM_OFFSET: usize = SAFETY_BUFFER + 40300000;
const SPAWN_GRID_OFF: usize  = SAFETY_BUFFER + 19600000;
const NEURAL_COHERENCE_OFF: usize = SAFETY_BUFFER + 40300104;
const PHYSICS_READ_XS_OFF: usize = SAFETY_BUFFER + 40400000;
const PHYSICS_READ_YS_OFF: usize = SAFETY_BUFFER + 40600000;
const PHYSICS_READ_ENERGY_OFF: usize = SAFETY_BUFFER + 40800000;
const PHYSICS_READ_RESONANCE_OFF: usize = SAFETY_BUFFER + 41200000;
const ENERGY_DELTA_OFF: usize = SAFETY_BUFFER + 41600000;
const RESONANCE_DELTA_OFF: usize = SAFETY_BUFFER + 42000000;
const SPAWN_HEAD_OFF: usize  = SPAWN_GRID_OFF;
const SPAWN_DATA_OFF: usize  = SPAWN_GRID_OFF + 8;
const SPAWN_MAX: i32         = 1024;
const SPAWN_SLOT: i32        = 16;

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

const CRYSTAL_MEME: i32 = 10;       // Type for memetic nodes
const MEME_TRANSFER_PROB: i32 = 8;  // ~12.5% chance per tick for meme absorption
const MAX_ASCENSIONS: i32 = 64;

@inline function getEnergy(idx: i32): i32 { return load<i32>(ENERGY_OFFSET + (idx << 2) as usize); }
@inline function setEnergy(idx: i32, val: i32): void { store<i32>(ENERGY_OFFSET + (idx << 2) as usize, val); }
@inline function getResonance(idx: i32): i32 { return load<i32>(RESONANCE_OFFSET + (idx << 2) as usize); }
@inline function setResonance(idx: i32, val: i32): void { store<i32>(RESONANCE_OFFSET + (idx << 2) as usize, val); }
@inline function getPhase(idx: i32): i32 { return load<i32>(PHASE_OFFSET + (idx << 2) as usize); }
@inline function setPhase(idx: i32, val: i32): void { store<i32>(PHASE_OFFSET + (idx << 2) as usize, val); }
@inline function getX(idx: i32): i16 { return load<i16>(XS_OFFSET + (idx << 1) as usize); }
@inline function getY(idx: i32): i16 { return load<i16>(YS_OFFSET + (idx << 1) as usize); }
@inline function getReadX(idx: i32): i16 { return load<i16>(PHYSICS_READ_XS_OFF + (idx << 1) as usize); }
@inline function getReadY(idx: i32): i16 { return load<i16>(PHYSICS_READ_YS_OFF + (idx << 1) as usize); }
@inline function getReadEnergy(idx: i32): i32 { return load<i32>(PHYSICS_READ_ENERGY_OFF + (idx << 2) as usize); }
@inline function getReadResonance(idx: i32): i32 { return load<i32>(PHYSICS_READ_RESONANCE_OFF + (idx << 2) as usize); }
@inline function addEnergyDelta(idx: i32, delta: i32): void {
    if (delta != 0) atomic.add<i32>(ENERGY_DELTA_OFF + (idx << 2) as usize, delta);
}
@inline function addResonanceDelta(idx: i32, delta: i32): void {
    if (delta != 0) atomic.add<i32>(RESONANCE_DELTA_OFF + (idx << 2) as usize, delta);
}
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
            addResonanceDelta(target, signalStrength);
        }
    }
}

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
const OP_PLUG: u8 = 0xA4;
const OP_TENSEGRITY: u8 = 0xA5;
const OP_COLLECTIVE: u8 = 0xA6;
const OP_ROLE: u8 = 0xA7;
const OP_BUILD: u8 = 0xA8;
const OP_SENSE: u8 = 0xA9;

// Role constants moved to Vector 7 section

// Property IDs for GET/PUT
const PROP_ENERGY: u8 = 0;
const PROP_RESONANCE: u8 = 1;
const PROP_X: u8 = 2;
const PROP_Y: u8 = 3;
const PROP_PHASE: u8 = 4;
const PROP_GRID_CHARGE: u8 = 7;
const PROP_QUORUM: u8 = 8;
const PROP_NEURAL_COHERENCE: u8 = 9;
const PROP_MEMORY: u8 = 10;

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
@inline function setBondDist(atomIdx: i32, slot: i32, dist: u8): void {
    store<u8>(BOND_DIST_OFF + (atomIdx << 2) + slot as usize, dist);
}
@inline function setDamping(atomIdx: i32, val: u8): void {
    store<u8>(DAMPING_OFF + atomIdx as usize, val);
}
@inline function getRole(atomIdx: i32): u8 {
    return load<u8>(ROLES_OFFSET + atomIdx as usize);
}
@inline function setRole(atomIdx: i32, val: u8): void {
    store<u8>(ROLES_OFFSET + atomIdx as usize, val);
}
@inline function setHiveMemory(addr: i32, val: u8): void {
    store<u8>(HIVE_MEMORY_OFF + (addr & 1023) as usize, val);
}
@inline function getHiveMemory(addr: i32): u8 {
    return load<u8>(HIVE_MEMORY_OFF + (addr & 1023) as usize);
}
@inline function getHiveBalance(): i32 {
    return atomic.load<i32>(HIVE_BALANCE_OFF);
}
@inline function addHiveBalance(val: i32): i32 {
    return atomic.add<i32>(HIVE_BALANCE_OFF, val);
}

// --- VECTOR 7: THE QUANTUM SHIFT ---

const ROLE_NEUTRAL: u8 = 0;
const ROLE_PRODUCER: u8 = 1;
const ROLE_GUARDIAN: u8 = 2;
const ROLE_ARCHITECT: u8 = 3;
const ROLE_PARASITE: u8 = 4;
const WORLD_MAX_X: i32 = 1399;
const WORLD_MAX_Y: i32 = 799;

@inline function clampWorldX(x: i32): i32 {
    if (x < 0) return 0;
    if (x > WORLD_MAX_X) return WORLD_MAX_X;
    return x;
}

@inline function clampWorldY(y: i32): i32 {
    if (y < 0) return 0;
    if (y > WORLD_MAX_Y) return WORLD_MAX_Y;
    return y;
}

@inline function storeClampedPos(idx: i32, x: i32, y: i32): void {
    store<i16>(XS_OFFSET + (idx << 1) as usize, clampWorldX(x) as i16);
    store<i16>(YS_OFFSET + (idx << 1) as usize, clampWorldY(y) as i16);
}

@inline function dir4X(n: i32): i32 {
    if (n == 0) return -1;
    if (n == 1) return 1;
    return 0;
}

@inline function dir4Y(n: i32): i32 {
    if (n == 2) return -1;
    if (n == 3) return 1;
    return 0;
}

@inline function dir8X(n: i32): i32 {
    if (n == 0 || n == 4 || n == 6) return -1;
    if (n == 1 || n == 5 || n == 7) return 1;
    return 0;
}

@inline function dir8Y(n: i32): i32 {
    if (n == 2 || n == 4 || n == 5) return -1;
    if (n == 3 || n == 6 || n == 7) return 1;
    return 0;
}

@inline function getGenomeVelocityX(idx: i32): i32 {
    let vx: i32 = 0;
    for (let b = 0; b < 2; b++) {
        let byte = getLogicByte(idx, b);
        let hi = (byte >> 4) & 0x0F;
        vx += (hi > 7 ? hi - 7 : hi - 8) * 3;
        let lo = byte & 0x0F;
        vx += (lo > 7 ? lo - 7 : lo - 8) * 3;
    }
    return vx;
}

@inline function getGenomeVelocityY(idx: i32): i32 {
    let vy: i32 = 0;
    for (let b = 2; b < 4; b++) {
        let byte = getLogicByte(idx, b);
        let hi = (byte >> 4) & 0x0F;
        vy += (hi > 7 ? hi - 7 : hi - 8) * 3;
        let lo = byte & 0x0F;
        vy += (lo > 7 ? lo - 7 : lo - 8) * 3;
    }
    return vy;
}

@inline function calculateTrophism(idx: i32, x: i32, y: i32, role: u8): void {
    let tx: f32 = 0;
    let ty: f32 = 0;
    const radius: f32 = 250.0;
    const detectionRadiusSq: f32 = 225.0; // 15^2
    const flow: i32 = (0.2 * 1000.0) as i32; // Using 1000.0 for literal scale
    const burn: i32 = (1.0 * 1000.0) as i32;
    let energy = getReadEnergy(idx);

    const gx = x / 10;
    const gy = y / 10;
    
    // Scan neighborhood for chemotaxis, trophic flow, and social recognition
    for (let oy = -3; oy <= 3; oy++) {
        for (let ox = -3; ox <= 3; ox++) {
            let cx = gx + ox;
            let cy = gy + oy;
            if (cx >= 0 && cx < 140 && cy >= 0 && cy < 80) {
                let count = getSpatialGridCount(cx, cy);
                for (let s = 0; s < count; s++) {
                    let otherIdx = getSpatialGridAtom(cx, cy, s);
                    if (otherIdx == idx || otherIdx >= MAX_ATOMS) continue;
                    
                    let oX = getReadX(otherIdx) as f32;
                    let oY = getReadY(otherIdx) as f32;
                    let dx = oX - (x as f32);
                    let dy = oY - (y as f32);
                    let d2 = dx*dx + dy*dy;
                    if (d2 < 1.0) continue;

                    // --- PHASE 15: SOCIAL RECOGNITION (AVOIDANCE) ---
                    if (d2 < 100.0) { // Too close!
                        tx -= dx * 0.5;
                        ty -= dy * 0.5;
                    }

                    // --- PHASE 17+: TROPHIC FLOW ---
                    if (d2 <= detectionRadiusSq) {
                        let otherRole = getRole(otherIdx);
                        if (role == ROLE_PRODUCER && otherRole == ROLE_NEUTRAL) {
                            if (energy > 100 * 1000) {
                                addEnergyDelta(idx, -flow);
                                addEnergyDelta(otherIdx, flow);
                                energy -= flow;
                            }
                        }
                        if (role == ROLE_GUARDIAN && otherRole == ROLE_PARASITE) {
                            let oEnergy = getReadEnergy(otherIdx);
                            if (oEnergy > 0) {
                                addEnergyDelta(otherIdx, -Mathf.min(oEnergy as f32, burn as f32) as i32);
                                addResonanceDelta(idx, 5);
                            }
                        }
                    }

                    if (d2 > radius * radius) continue;
                    let d = Mathf.sqrt(d2);

                    // --- PHASE 14: CHEMOTAXIS ---
                    let oEnergy = getReadEnergy(otherIdx);
                    let oRes = getReadResonance(otherIdx);

                    let multiplier: f32 = 1.0;
                    if (role == ROLE_GUARDIAN && oRes > 50) multiplier = 3.0;
                    if (role == ROLE_PRODUCER && (oEnergy as f32) < 50000.0) multiplier = 2.0; // 50.0 * 1000

                    let force = ((oEnergy as f32) / 100000.0) * ((radius - d) / radius) * (2.0 * multiplier);
                    tx += (dx / d) * force;
                    ty += (dy / d) * force;
                }
            }
        }
    }

    if (role == ROLE_ARCHITECT) {
        // Simple 4-way density check
        for (let i = 0; i < 4; i++) {
            let ox: i32 = 0;
            let oy: i32 = 0;
            if (i == 0) {
                oy = -2;
            } else if (i == 1) {
                oy = 2;
            } else if (i == 2) {
                ox = -2;
            } else {
                ox = 2;
            }
            let cx = gx + ox;
            let cy = gy + oy;
            if (cx >= 0 && cx < 140 && cy >= 0 && cy < 80) {
                let cell = load<i32>(STRUCTURE_GRID_OFF + ((cy * 140 + cx) << 2));
                let density = (cell >> 8) & 0xFF;
                let force = (255.0 as f32 - (density as f32)) / (50.0 as f32);
                tx += ((ox as f32) / (2.0 as f32)) * force;
                ty += ((oy as f32) / (2.0 as f32)) * force;
            }
        }
    }

    // Final position integration (velocity)
    storeClampedPos(idx, x + (Math.round(tx) as i32), y + (Math.round(ty) as i32));
}

@inline function applyBondSprings(idx: i32, x: i32, y: i32): void {
    let fx: f32 = 0;
    let fy: f32 = 0;
    let damping = load<u8>(DAMPING_OFF + idx as usize);

    for (let b = 0; b < 4; b++) {
        let targetIdx = getBondTarget(idx, b);
        if (targetIdx == 0 || targetIdx >= MAX_ATOMS) continue;

        let targetDist = load<u8>(BOND_DIST_OFF + (idx << 2) + b as usize);
        if (targetDist == 0) targetDist = 50;

        let stiffness = getBondStiffness(idx, b);
        let pX = getReadX(targetIdx) as f32;
        let pY = getReadY(targetIdx) as f32;
        let dx = pX - (x as f32);
        let dy = pY - (y as f32);
        let dist = Mathf.sqrt(dx*dx + dy*dy);
        if (dist < 1.0) dist = 1.0;

        if (stiffness > 0.8) {
            let force = (dist - (targetDist as f32)) * 1.5;
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
        } else {
            let elasticRange: f32 = 10.0;
            if (dist > (targetDist as f32) + elasticRange) {
                let force = (dist - ((targetDist as f32) + elasticRange)) * 0.1;
                fx += (dx / dist) * force;
                fy += (dy / dist) * force;
            } else if (dist < (targetDist as f32) - elasticRange) {
                let force = (((targetDist as f32) - elasticRange) - dist) * 0.2;
                fx -= (dx / dist) * force;
                fy -= (dy / dist) * force;
            }
        }
    }

    if (damping > 0) {
        let dampingFactor = Mathf.max(0, 1.0 - ((damping as f32) / 255.0));
        fx *= dampingFactor;
        fy *= dampingFactor;
    }

    storeClampedPos(idx, x + (Math.round(fx) as i32), y + (Math.round(fy) as i32));
}

export function execute_atom(atomIndex: i32): void {
    let id = load<u64>(IDS_OFFSET + (atomIndex << 3) as usize);
    let curX = getReadX(atomIndex) as i32;
    let curY = getReadY(atomIndex) as i32;
    let role = getRole(atomIndex);

    // --- VECTOR 7: THE QUANTUM SHIFT ---
    // If id > 10, calculate physics (matching JS neural verification)
    if (id > 10) {
        let vx = getGenomeVelocityX(atomIndex);
        let vy = getGenomeVelocityY(atomIndex);
        
        applyBondSprings(atomIndex, curX, curY);
        calculateTrophism(atomIndex, curX, curY, role);
        
        // Final position integration (velocity)
        let midX = getX(atomIndex) as i32;
        let midY = getY(atomIndex) as i32;
        let damping = load<u8>(DAMPING_OFF + atomIndex as usize);
        let dampingFactor = Mathf.max(0, 1.0 - ((damping as f32) / 255.0));
        
        // Behavior velocity is added on top of force integration
        let nextX = midX + (vx * 2 * (dampingFactor as i32));
        let nextY = midY + (vy * 2 * (dampingFactor as i32));
        storeClampedPos(atomIndex, nextX, nextY);
    }

    let pc = getPC(atomIndex);
    let energy = getReadEnergy(atomIndex);
    let resonance = getReadResonance(atomIndex);
    const instr_base: usize = INSTRUCTIONS_OFFSET + (atomIndex << 6) as usize;
    
    // Safety: 16 instructions per tick max to prevent infinite loops
    let step: i32 = 0;
    for (; step < 16; step++) {
        const op = load<u8>(instr_base + (pc as usize));
        if (op == OP_NOP) break;

        trace_atom(atomIndex, op as i32, curX / 10, curY / 10, pc as i32);

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
                else if (prop == PROP_GRID_CHARGE) {
                    let rx = getX(atomIndex) as i32;
                    let ry = getY(atomIndex) as i32;
                    let gx = rx / 10;
                    let gy = ry / 10;
                    if (gx >= 0 && gx < 140 && gy >= 0 && gy < 80) {
                        let cellVal = atomic.load<i32>(STRUCTURE_GRID_OFF + ((gy * 140 + gx) << 2));
                        val = (cellVal >> 16) & 0xFF;
                    }
                }
                else if (prop == PROP_QUORUM) {
                    let rx = getX(atomIndex) as i32;
                    let ry = getY(atomIndex) as i32;
                    let gx = rx / 10;
                    let gy = ry / 10;
                    if (gx >= 0 && gx < 140 && gy >= 0 && gy < 80) {
                        val = getSpatialGridCount(gx, gy);
                    }
                }
                else if (prop == PROP_NEURAL_COHERENCE) {
                    val = atomic.load<i32>(NEURAL_COHERENCE_OFF);
                }
                else if (prop == PROP_MEMORY) {
                    let rx = getX(atomIndex) as i32;
                    let ry = getY(atomIndex) as i32;
                    let gx = rx / 10;
                    let gy = ry / 10;
                    if (gx >= 0 && gx < 140 && gy >= 0 && gy < 80) {
                        val = load<u8>(MEMORY_GRID_OFF + ((gy * 140 + gx) << 3)) as i32;
                    }
                }
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
                // Bio-Digital Injection: Atom adds charge to the grid
                let rx = getX(atomIndex) as i32;
                let ry = getY(atomIndex) as i32;
                let gx = rx / 10;
                let gy = ry / 10;
                if (gx >= 0 && gx < 140 && gy >= 0 && gy < 80) {
                    let cellIdx = gy * 140 + gx;
                    let currentResonance = resonance;
                    let bonus = (currentResonance / 10) > 55 ? 55 : (currentResonance / 10);
                    
                    let cellVal = atomic.load<i32>(STRUCTURE_GRID_OFF + (cellIdx << 2));
                    let nextCharge = 200 + bonus;
                    if (nextCharge > 255) nextCharge = 255;
                    atomic.store<i32>(STRUCTURE_GRID_OFF + (cellIdx << 2), (cellVal & ~0x00FF0000) | (nextCharge << 16));
                }
                fireSignal(atomIndex); // Also fire biological signal to neighbors
                pc += 1;
                break;
            }
            case OP_PLUG: {
                let mode = load<u8>(instr_base + (pc + 1) as usize);
                let reg  = load<u8>(instr_base + (pc + 2) as usize);
                let gx = (getX(atomIndex) as i32) / 10;
                let gy = (getY(atomIndex) as i32) / 10;
                let gridIdx = (gy * 140 + gx) as usize;

                if (mode == 0) { // READ CHARGE
                    let cell = load<i32>(STRUCTURE_GRID_OFF + (gridIdx << 2));
                    let charge = (cell >> 16) & 0xFF;
                    setReg(atomIndex, reg as i32, charge);
                    trace_atom(atomIndex, 0xA4, gx, gy, charge);
                } else if (mode == 1) { // WRITE CHARGE
                    let charge = getReg(atomIndex, reg as i32) & 0xFF;
                    let current = load<i32>(STRUCTURE_GRID_OFF + (gridIdx << 2));
                    store<i32>(STRUCTURE_GRID_OFF + (gridIdx << 2), (current & ~0x00FF0000) | (charge << 16));
                    energy -= 10; 
                }
                pc += 3;
                break;
            }
            case OP_TENSEGRITY: {
                let mode = load<u8>(instr_base + (pc + 1) as usize);
                let p2   = load<u8>(instr_base + (pc + 2) as usize);
                let p3   = load<u8>(instr_base + (pc + 3) as usize);
                
                if (mode == 0) { // SET_BOND_DIST slot, dist
                    setBondDist(atomIndex, p2 as i32, p3);
                } else if (mode == 1) { // SET_DAMPING val
                    setDamping(atomIndex, p2);
                }
                pc += 4;
                break;
            }
            case OP_COLLECTIVE: {
                let mode = load<u8>(instr_base + (pc + 1) as usize);
                let p2   = load<u8>(instr_base + (pc + 2) as usize);
                let p3   = load<u8>(instr_base + (pc + 3) as usize);
                
                if (mode == 0) { // HIVE_STORE addr, val
                    setHiveMemory(p2 as i32, p3);
                } else if (mode == 1) { // HIVE_LOAD addr, reg
                    setReg(atomIndex, p3 as i32, getHiveMemory(p2 as i32) as i32);
                } else if (mode == 2) { // PHEROMONE_EMIT intensity, type
                    let gx = getX(atomIndex) / 10;
                    let gy = getY(atomIndex) / 10;
                    let gridIdx = gy * 140 + gx;
                    store<i32>(SIGNAL_GRID_OFF + (gridIdx << 2) as usize, (p2 as i32 << 8) | (p3 as i32));
                } else if (mode == 3) { // BANK_DEPOSIT val
                    let val = p2 as i32;
                    if (energy >= val) {
                        addHiveBalance(val);
                        energy -= val;
                    }
                } else if (mode == 4) { // BANK_WITHDRAW reg
                    let reg = p2 as i32;
                    let balance = getHiveBalance();
                    let amount = balance > 100 ? 100 : balance;
                    if (amount > 0) {
                        addHiveBalance(-amount);
                        energy += amount;
                    }
                    setReg(atomIndex, reg & 7, amount);
                } else if (mode == 5) { // PHASE_LOCK
                    // Set all bonded neighbors to current PC
                    for (let b = 0; b < 4; b++) {
                        let target = getBondTarget(atomIndex, b);
                        if (target > 0 && target < MAX_ATOMS) {
                            setPC(target, pc + 4); // Jump them past this instruction
                        }
                    }
                } else if (mode == 6) { // PC_SYNC_QUORUM
                    // Group Intelligence: Synchronize PC with all neighbors in cell
                    let rx = getX(atomIndex) as i32;
                    let ry = getY(atomIndex) as i32;
                    let gx = rx / 10;
                    let gy = ry / 10;
                    let count = getSpatialGridCount(gx, gy);
                    for (let i = 0; i < count; i++) {
                        let neighborIdx = getSpatialGridAtom(gx, gy, i);
                        if (neighborIdx != atomIndex && neighborIdx >= 0 && neighborIdx < MAX_ATOMS) {
                            setPC(neighborIdx, pc + 4); // Set neighbor to next instruction
                        }
                    }
                }
                pc += 4;
                break;
            }
            case OP_ROLE: {
                let mode = load<u8>(instr_base + (pc + 1) as usize);
                let val  = load<u8>(instr_base + (pc + 2) as usize);
                if (mode == 0) {
                    setRole(atomIndex, val);
                    role = val;
                }
                pc += 3;
                break;
            }
            case OP_SHARE: { // SHARE_ENERGY slot, percentage
                const slot = load<u8>(instr_base + pc as usize + 1) & 3;
                const percentage = load<u8>(instr_base + pc as usize + 2);
                
                let targetIdx = getBondTarget(atomIndex, slot);
                if (targetIdx > 0 && targetIdx < MAX_ATOMS) {
                    let amount = (energy * (percentage as i32)) / 100;
                    if (energy >= amount) {
                        energy -= amount;
                        addEnergyDelta(targetIdx, amount);
                    }
                }
                pc += 3;
                break;
            }
            case OP_BUILD: { // BUILD type, state
                if (role == 3) { // ROLE_ARCHITECT
                    let type = load<u8>(instr_base + (pc + 1) as usize);
                    let state = load<u8>(instr_base + (pc + 2) as usize);
                    if (energy >= 500) {
                        energy -= 500;
                        let rx = getX(atomIndex) as i32;
                        let ry = getY(atomIndex) as i32;
                        
                        let dx: i32 = (resonance % 3) - 1;
                        let dy: i32 = ((resonance * 7) % 3) - 1;
                        let tx = (rx / 10) + dx;
                        let ty = (ry / 10) + dy;
                        
                        if (tx >= 0 && tx < 140 && ty >= 0 && ty < 80) {
                            let cellIdx = ty * 140 + tx;
                            let newVal = (state as i32 << 24) | (type as i32 & 0xFF);
                            atomic.store<i32>(STRUCTURE_GRID_OFF + (cellIdx << 2), newVal);
                        }
                    }
                }
                pc += 3;
                break;
            }
            case OP_SENSE: {
                // Structural Sensing: Detects neighbors of target type
                let reg = load<u8>(instr_base + (pc + 1) as usize);
                let targetType = load<u8>(instr_base + (pc + 2) as usize);
                let rx = getX(atomIndex) as i32;
                let ry = getY(atomIndex) as i32;
                let gx = rx / 10;
                let gy = ry / 10;
                let found: i32 = 0;
                
                for (let n = 0; n < 8; n++) {
                    let nx = gx + dir8X(n);
                    let ny = gy + dir8Y(n);
                    if (nx >= 0 && nx < 140 && ny >= 0 && ny < 80) {
                        let ni = ny * 140 + nx;
                        let cellVal = atomic.load<i32>(STRUCTURE_GRID_OFF + (ni << 2));
                        if ((cellVal & 0xFF) == (targetType as i32)) {
                            found = 1;
                            break;
                        }
                    }
                }
                setReg(atomIndex, reg as i32, found);
                pc += 3;
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

    // Metabolic Cost
    let metabolicCost = 1 + (step >> 1); // 1 to 9 energy units per tick
    
    // Auto-Firing Action Potential
    if (resonance > 300) {
        if (energy > 200) {
            energy -= 200; 
            setResonance(atomIndex, 0);
            setPhase(atomIndex, 5);
            fireSignal(atomIndex);
        } else {
            setResonance(atomIndex, 280); 
        }
    }

    if (resonance > 0) setResonance(atomIndex, resonance - 2);
    setEnergy(atomIndex, energy > metabolicCost ? energy - metabolicCost : 0);
}

// --- VECTOR 8: THE CRYSTALLINE LATTICE ---

const STR_VOID: i32 = 0;
const STR_WIRE: i32 = 1;
const STR_NODE: i32 = 2;
const STR_DIODE: i32 = 3;
const STR_SOURCE: i32 = 4;
const STR_SINK: i32 = 5;
const STR_CAPACITOR: i32 = 6;

export function build_spatial_hash(): void {
    const GRID_COLS: i32 = 140;
    const GRID_ROWS: i32 = 80;
    const TOTAL_CELLS: i32 = 11200; // 140 * 80
    const CELL_CAPACITY: i32 = 31;
    
    // 1. Clear Grid and Quorum
    for (let i = 0; i < TOTAL_CELLS; i++) {
        atomic.store<i32>(SPATIAL_GRID_OFFSET + (i << 7) as usize, 0);
        // Clear Quorum (8 roles)
        let qOff = QUORUM_OFFSET + (i << 5) as usize;
        store<u64>(qOff, 0);
        store<u64>(qOff + 8, 0);
        store<u64>(qOff + 16, 0);
        store<u64>(qOff + 24, 0);
    }

    // 2. Bin Atoms
    for (let idx = 0; idx < MAX_ATOMS; idx++) {
        let id = load<u64>(IDS_OFFSET + (idx << 3) as usize);
        if (id == 0) continue;

        let x = getX(idx) as i32;
        let y = getY(idx) as i32;
        
        // Clamp
        if (x < 0) x = 0; if (x > 1399) x = 1399;
        if (y < 0) y = 0; if (y > 799) y = 799;

        let cellX = x / 10;
        let cellY = y / 10;
        let cellIdx = cellY * GRID_COLS + cellX;
        let offset = SPATIAL_GRID_OFFSET + (cellIdx << 7);

        // Atomic update of count
        let count = atomic.load<i32>(offset as usize);
        if (count < CELL_CAPACITY - 1) {
            let nextSlot = atomic.add<i32>(offset as usize, 1) + 1;
            store<i32>((offset + (nextSlot << 2)) as usize, idx);
            
            // Phase tracking (Era 50)
            let myPhase = getPhase(idx);
            atomic.add<i32>((offset + (CELL_CAPACITY << 2)) as usize, myPhase);

            // Role quorum (Era 55)
            let role = getRole(idx);
            let safeRole = role > 7 ? 7 : role;
            atomic.add<i32>(QUORUM_OFFSET + (cellIdx << 5) + (safeRole << 2) as usize, 1);
        }
    }

    // 3. Finalize Phase Averages
    for (let i = 0; i < TOTAL_CELLS; i++) {
        let offset = SPATIAL_GRID_OFFSET + (i << 7);
        let count = atomic.load<i32>(offset as usize);
        if (count > 0) {
            let sum = atomic.load<i32>((offset + (CELL_CAPACITY << 2)) as usize);
            // We reuse slot 31 (CELL_CAPACITY) for the average after clearing the sum
            atomic.store<i32>((offset + (CELL_CAPACITY << 2)) as usize, sum / count);
        }
    }
}

export function tick_structure_grid(): void {
    const GRID_W: i32 = 140;
    const GRID_H: i32 = 80;

    // Use a temporary stack buffer for charges if possible, or just write-behind
    // Since this is usually called from one worker, we can afford a bit of drift or use a small scratchpad
    // But for 11200 cells, we should probably just use a dedicated scratch area in shared memory if we want bit-perfection
    // However, the current JS structure engine uses a local array. We'll do same-buffer update for simplicity 
    // but with a slight decay to prevent runaway feedback.

    for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
            const i = y * GRID_W + x;
            const cellVal = atomic.load<i32>(STRUCTURE_GRID_OFF + (i << 2));
            const type = cellVal & 0xFF;
            const currentCharge = (cellVal >> 16) & 0xFF;
            
            // --- AUTOPOIESIS: Spontaneous Crystallization ---
            if (type == STR_VOID) {
                let maxNCharge: i32 = currentCharge;
                for (let n = 0; n < 8; n++) {
                    let nx = x + dir8X(n);
                    let ny = y + dir8Y(n);
                    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
                        let ni = ny * GRID_W + nx;
                        let nVal = atomic.load<i32>(STRUCTURE_GRID_OFF + (ni << 2));
                        let nCharge = (nVal >> 16) & 0xFF;
                        if (nCharge > maxNCharge) maxNCharge = nCharge;
                    }
                }
                if (maxNCharge > 100) {
                    let seedCharge = maxNCharge - 20;
                    if (seedCharge < 64) seedCharge = 64;
                    if (seedCharge > 255) seedCharge = 255;
                    atomic.store<i32>(
                        STRUCTURE_GRID_OFF + (i << 2),
                        STR_WIRE | (seedCharge << 16),
                    );
                } else if (currentCharge > 0) {
                    const decayed = currentCharge > 8 ? currentCharge - 8 : 0;
                    atomic.store<i32>(
                        STRUCTURE_GRID_OFF + (i << 2),
                        (cellVal & ~0x00FF0000) | (decayed << 16),
                    );
                }
                continue;
            }

            const state = (cellVal >> 24) & 0xFF;
            let nextCharge = currentCharge > 10 ? currentCharge - 10 : 0;

            if (type == STR_SOURCE) {
                nextCharge = 255;
            } else if (type == STR_WIRE || type == STR_NODE || type == STR_CAPACITOR) {
                let maxNeighborCharge: i32 = 0;
                let chargedCount: i32 = 0;

                for (let n = 0; n < 4; n++) {
                    let nx = x + dir4X(n);
                    let ny = y + dir4Y(n);
                    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
                        let ni = ny * GRID_W + nx;
                        let nVal = atomic.load<i32>(STRUCTURE_GRID_OFF + (ni << 2));
                        let nCharge = (nVal >> 16) & 0xFF;
                        if (nCharge > maxNeighborCharge) maxNeighborCharge = nCharge;
                        if (nCharge > 50) chargedCount++;
                    }
                }

                if (type == STR_WIRE) {
                    let flow = maxNeighborCharge - 5;
                    if (flow > nextCharge) nextCharge = flow;
                } else if (type == STR_NODE) {
                    if (state == 1) { // AND
                        if (chargedCount >= 2) nextCharge = 255;
                    } else { // OR
                        if (chargedCount >= 1) nextCharge = 255;
                    }
                } else if (type == STR_CAPACITOR) {
                    let flow = maxNeighborCharge - 2;
                    if (flow > nextCharge) nextCharge = flow;
                }
            } else if (type == STR_DIODE) {
                // direction = state (0:L, 1:R, 2:U, 3:D)
                let nx = x; let ny = y;
                if (state == 0) nx--;
                else if (state == 1) nx++;
                else if (state == 2) ny--;
                else if (state == 3) ny++;

                if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
                    let ni = ny * GRID_W + nx;
                    let nVal = atomic.load<i32>(STRUCTURE_GRID_OFF + (ni << 2));
                    let nCharge = (nVal >> 16) & 0xFF;
                    let flow = nCharge - 5;
                    if (flow > nextCharge) nextCharge = flow;
                }
            }

            if (type != STR_SOURCE && nextCharge == 0) {
                let stabilized = false;
                for (let n = 0; n < 4; n++) {
                    let nx = x + dir4X(n);
                    let ny = y + dir4Y(n);
                    if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
                        let ni = ny * GRID_W + nx;
                        let nVal = atomic.load<i32>(STRUCTURE_GRID_OFF + (ni << 2));
                        let nCharge = (nVal >> 16) & 0xFF;
                        if (nCharge > 20) {
                            stabilized = true;
                            break;
                        }
                    }
                }
                if (!stabilized) {
                    atomic.store<i32>(STRUCTURE_GRID_OFF + (i << 2), STR_VOID);
                    continue;
                }
            }

            atomic.store<i32>(STRUCTURE_GRID_OFF + (i << 2), (cellVal & ~0x00FF0000) | (nextCharge << 16));
        }
    }
}

// Deprecated in favor of tick_structure_grid, kept for legacy compatibility if needed
export function tick_matrix(): void {
    tick_structure_grid();
}

// --- Phase 19: Planetary Consciousness Exports ---

// SOVEREIGN_ORACLE calls this every N ticks to measure global mind-field strength
export function get_neural_coherence(): i32 {
    const GRID_CELLS = 140 * 80;
    let totalAmplitude: i32 = 0;
    let oscillatorCount: i32 = 0;

    for (let i = 0; i < GRID_CELLS; i++) {
        const cVal = atomic.load<i32>(STRUCTURE_GRID_OFF + (i << 2));
        const cType = cVal & 0xFF;
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
