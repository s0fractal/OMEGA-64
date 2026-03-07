// OMEGA-64 | assembly/index.ts | Zero-Allocation WASM VM Core

declare function trace_atom(
  idx: i32,
  opcode: i32,
  gx: i32,
  gy: i32,
  targetIdx: i32,
): void;

const TRACE_THRESHOLD: u64 = 20; // Trace logic for atoms with ID < TRACE_THRESHOLD
const RESOURCE_MAX: i32 = 2000000000;

// EXACT UNIFIED OFFSETS
const MAX_ATOMS: i32 = 100000;
const SAFETY_BUFFER: usize = 8000000;
const TICK_COUNTER_OFF: usize = SAFETY_BUFFER - 8;
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
const SIGNAL_GRID_OFF: usize = SAFETY_BUFFER + 35200000;
const DECAY_COUNTER_OFF: usize = SAFETY_BUFFER + 35000000; // Keep separate if needed, but watch it
const MEMORY_GRID_OFF: usize = SAFETY_BUFFER + 36200000;
const ASCENSION_STATS_OFF: usize = SAFETY_BUFFER + 37200000;
const BOND_DIST_OFF: usize = SAFETY_BUFFER + 38200000;
const DAMPING_OFF: usize = SAFETY_BUFFER + 39200000;
const CAUSALITY_OFF: usize = SAFETY_BUFFER + 39300000;
const HIVE_MEMORY_OFF: usize = SAFETY_BUFFER + 40200000;
const HIVE_BALANCE_OFF: usize = SAFETY_BUFFER + 40201024;
const QUORUM_OFFSET: usize = SAFETY_BUFFER + 40300000;
const SPAWN_GRID_OFF: usize = SAFETY_BUFFER + 19600000;
const NEURAL_COHERENCE_OFF: usize = SAFETY_BUFFER + 40300104;
const PHYSICS_READ_XS_OFF: usize = SAFETY_BUFFER + 40400000;
const PHYSICS_READ_YS_OFF: usize = SAFETY_BUFFER + 40600000;
const PHYSICS_READ_ENERGY_OFF: usize = SAFETY_BUFFER + 40800000;
const PHYSICS_READ_RESONANCE_OFF: usize = SAFETY_BUFFER + 41200000;
const ENERGY_DELTA_OFF: usize = SAFETY_BUFFER + 41600000;
const RESONANCE_DELTA_OFF: usize = SAFETY_BUFFER + 42000000;
const STRUCTURE_BUILD_OWNER_OFF: usize = SAFETY_BUFFER + 42400000;
const STRUCTURE_BUILD_VALUE_OFF: usize = SAFETY_BUFFER + 42444800;
const STRUCTURE_CHARGE_INTENT_OFF: usize = SAFETY_BUFFER + 42489600;
const ATTENTION_FIELD_OFF: usize = SAFETY_BUFFER + 42534400;
const HIVE_ENERGY_POOL_OFF: usize = SAFETY_BUFFER + 42579200;
const GLYPH_HEADER_OFF: usize = SAFETY_BUFFER + 42580224;
const GLYPH_PAYLOAD_OFF: usize = SAFETY_BUFFER + 42625024;
const GLYPH_SCRATCH_HEADER_OFF: usize = SAFETY_BUFFER + 42714624;
const GLYPH_SCRATCH_PAYLOAD_OFF: usize = SAFETY_BUFFER + 42759424;
const HORMONE_OFF: usize = SAFETY_BUFFER + 42849024; // 6x Uint16 physiological signals
const SECRETION_STATS_OFF: usize = SAFETY_BUFFER + 42849040; // 12 x I32 (5 roles x 2 kinds + 2 leaks)
const SPAWN_HEAD_OFF: usize = SPAWN_GRID_OFF;
const SPAWN_DATA_OFF: usize = SPAWN_GRID_OFF + 8;
const SPAWN_MAX: i32 = 1024;
const SPAWN_SLOT: i32 = 16;

const ISA_BIND: u8 = 0x40;
const ISA_SHARE: u8 = 0x41;
const ISA_SIGNAL: u8 = 0x42;
const ISA_READ_MATRIX: u8 = 0x43;
const ISA_INJECT: u8 = 0x44;
const ISA_BROADCAST: u8 = 0x45;
const ISA_ANNEX: u8 = 0x46;
const ISA_MUTATE: u8 = 0x47;
const ISA_RESONATE: u8 = 0x48;
const ISA_SENSE: u8 = 0x49; // Atom senses global neural coherence field
const ISA_ASCEND: u8 = 0xFF;

// Crystal type constants
const CRYSTAL_OSCILLATOR: i32 = 5;

const CRYSTAL_MEME: i32 = 10; // Type for memetic nodes
const MEME_TRANSFER_PROB: i32 = 8; // ~12.5% chance per tick for meme absorption
const MAX_ASCENSIONS: i32 = 64;
const PHEROMONE_COST_BASE: i32 = 10;
const PLASMID_COST_BASE: i32 = 25;

// --- ERA 71: FORCE ACCUMULATION ---
// Globals used during a single atom's execution cycle to prevent the "Triple Move" bug.
let accForceX: f32 = 0;
let accForceY: f32 = 0;

function clampResource(value: i64): i32 {
  if (value < 0) return 0;
  if (value > RESOURCE_MAX as i64) return RESOURCE_MAX;
  return value as i32;
}
function getEnergy(idx: i32): i32 {
  return load<i32>(ENERGY_OFFSET + (idx << 2) as usize);
}
function setEnergy(idx: i32, val: i32): void {
  store<i32>(ENERGY_OFFSET + (idx << 2) as usize, clampResource(val as i64));
}
function getResonance(idx: i32): i32 {
  return load<i32>(RESONANCE_OFFSET + (idx << 2) as usize);
}
function setResonance(idx: i32, val: i32): void {
  store<i32>(RESONANCE_OFFSET + (idx << 2) as usize, clampResource(val as i64));
}
function getPhase(idx: i32): i32 {
  return load<i32>(PHASE_OFFSET + (idx << 2) as usize);
}
function setPhase(idx: i32, val: i32): void {
  store<i32>(PHASE_OFFSET + (idx << 2) as usize, val);
}
// Read a global hormone value from the shared lattice (index 0..5).
// 0=entropy_pressure 1=time_viscosity 2=aggression 3=replication_bias 4=repair_drive 5=mutation_friction
@inline
function getHormone(id: i32): u16 {
  return atomic.load<u16>(HORMONE_OFF + (id << 1) as usize);
}
function getX(idx: i32): i16 {
  return load<i16>(XS_OFFSET + (idx << 1) as usize);
}
function getY(idx: i32): i16 {
  return load<i16>(YS_OFFSET + (idx << 1) as usize);
}
function getReadX(idx: i32): i16 {
  return load<i16>(PHYSICS_READ_XS_OFF + (idx << 1) as usize);
}
function getReadY(idx: i32): i16 {
  return load<i16>(PHYSICS_READ_YS_OFF + (idx << 1) as usize);
}
function getReadEnergy(idx: i32): i32 {
  return load<i32>(PHYSICS_READ_ENERGY_OFF + (idx << 2) as usize);
}
function getReadResonance(idx: i32): i32 {
  return load<i32>(PHYSICS_READ_RESONANCE_OFF + (idx << 2) as usize);
}
function addEnergyDelta(idx: i32, delta: i32): void {
  if (delta != 0) {
    atomic.add<i32>(ENERGY_DELTA_OFF + (idx << 2) as usize, delta);
  }
}
function addResonanceDelta(idx: i32, delta: i32): void {
  if (delta != 0) {
    atomic.add<i32>(RESONANCE_DELTA_OFF + (idx << 2) as usize, delta);
  }
}
const STRUCTURE_INTENT_LOCK_BIT: i32 = -2147483648;
const STRUCTURE_INTENT_OWNER_MASK: i32 = 0x7FFFFFFF;
const STRUCTURE_INTENT_SPIN_LIMIT: i32 = 128;
function publishBuildIntent(
  cellIdx: i32,
  ownerAtomIdx: i32,
  buildValue: i32,
): void {
  const ownerPtr = STRUCTURE_BUILD_OWNER_OFF + (cellIdx << 2) as usize;
  const valuePtr = STRUCTURE_BUILD_VALUE_OFF + (cellIdx << 2) as usize;
  const ownerToken = ownerAtomIdx + 1;

  for (let spin = 0; spin < STRUCTURE_INTENT_SPIN_LIMIT; spin++) {
    const snapshot = atomic.load<i32>(ownerPtr);
    if ((snapshot & STRUCTURE_INTENT_LOCK_BIT) != 0) continue;
    const winningOwner = snapshot & STRUCTURE_INTENT_OWNER_MASK;
    if (ownerToken < winningOwner) return;

    const observed = atomic.cmpxchg<i32>(
      ownerPtr,
      snapshot,
      snapshot | STRUCTURE_INTENT_LOCK_BIT,
    );
    if (observed != snapshot) continue;

    atomic.store<i32>(valuePtr, buildValue);
    atomic.store<i32>(ownerPtr, ownerToken);
    return;
  }
}
function publishChargeIntent(cellIdx: i32, requestedCharge: i32): void {
  const ptr = STRUCTURE_CHARGE_INTENT_OFF + (cellIdx << 2) as usize;
  let charge = requestedCharge;
  if (charge < 0) charge = 0;
  if (charge > 255) charge = 255;

  for (let spin = 0; spin < STRUCTURE_INTENT_SPIN_LIMIT; spin++) {
    const current = atomic.load<i32>(ptr);
    if (charge <= current) return;
    const observed = atomic.cmpxchg<i32>(ptr, current, charge);
    if (observed == current) return;
  }
}
function readStructureCell(cellIdx: i32): i32 {
  const ownerPtr = STRUCTURE_BUILD_OWNER_OFF + (cellIdx << 2) as usize;
  const valuePtr = STRUCTURE_BUILD_VALUE_OFF + (cellIdx << 2) as usize;
  const gridPtr = STRUCTURE_GRID_OFF + (cellIdx << 2) as usize;

  for (let spin = 0; spin < STRUCTURE_INTENT_SPIN_LIMIT; spin++) {
    const ownerRaw = atomic.load<i32>(ownerPtr);
    if ((ownerRaw & STRUCTURE_INTENT_LOCK_BIT) != 0) continue;
    if ((ownerRaw & STRUCTURE_INTENT_OWNER_MASK) != 0) {
      return atomic.load<i32>(valuePtr);
    }
    return atomic.load<i32>(gridPtr);
  }

  // Stale lock fallback: preserve forward progress under adversarial contention.
  return atomic.load<i32>(gridPtr);
}
function readStructureCharge(cellIdx: i32): i32 {
  const cellVal = readStructureCell(cellIdx);
  const baseCharge = (cellVal >> 16) & 0xFF;
  const intentCharge = atomic.load<i32>(
    STRUCTURE_CHARGE_INTENT_OFF + (cellIdx << 2) as usize,
  );
  return intentCharge > baseCharge ? intentCharge : baseCharge;
}
function getLogicByte(idx: i32, slot: i32): u8 {
  return load<u8>(LOGIC_OFFSET + (idx << 3) + slot as usize);
}
function getBondTarget(atomIdx: i32, slot: i32): i32 {
  return load<i32>(BONDS_OFFSET + (atomIdx << 4) + (slot << 2) as usize);
}
function setBondTarget(atomIdx: i32, slot: i32, targetIdx: i32): void {
  store<i32>(BONDS_OFFSET + (atomIdx << 4) + (slot << 2) as usize, targetIdx);
}
function getBondStiffness(atomIdx: i32, slot: i32): f32 {
  return load<f32>(STIFFNESS_OFFSET + (atomIdx << 4) + (slot << 2) as usize);
}
function setBondStiffness(atomIdx: i32, slot: i32, val: f32): void {
  store<f32>(STIFFNESS_OFFSET + (atomIdx << 4) + (slot << 2) as usize, val);
}

function writeBondRequest(initiator: i32, target: i32): void {
  let offset = BOND_REQUESTS_OFFSET + (initiator * 12);
  store<i32>(offset as usize, initiator + 1);
  store<i32>(offset + 4 as usize, target);
}

function getSpatialGridCount(gx: i32, gy: i32): i32 {
  let cellIdx = gy * 140 + gx;
  return load<i32>(SPATIAL_GRID_OFFSET + (cellIdx << 7) as usize);
}
function getSpatialGridAtom(gx: i32, gy: i32, subIdx: i32): i32 {
  let cellIdx = gy * 140 + gx;
  return load<i32>(
    SPATIAL_GRID_OFFSET + (cellIdx << 7) + ((subIdx + 1) << 2) as usize,
  );
}
function getAttentionCell(gx: i32, gy: i32): f32 {
  if (gx < 0 || gx >= 140 || gy < 0 || gy >= 80) return 0.0;
  return load<f32>(ATTENTION_FIELD_OFF + ((gy * 140 + gx) << 2) as usize);
}

function getGlyphInfluence(gx: i32, gy: i32, role: u8): f32 {
  if (gx < 0 || gx >= 140 || gy < 0 || gy >= 80) return 0.0;
  const cell = gy * 140 + gx;
  const header = atomic.load<i32>(GLYPH_HEADER_OFF + (cell << 2) as usize);
  const kind = header & 0xFF;
  const amplitude = ((header >>> 8) & 0x00FFFFFF) as f32;
  if (amplitude <= 0.0) return 0.0;
  const normalized = amplitude / 256.0;

  if (kind == 1) { // pheromone packet
    if (role == ROLE_PARASITE) return -normalized * 0.8;
    if (role == ROLE_GUARDIAN) return normalized * 0.4;
    if (role == ROLE_ARCHITECT) return normalized * 0.2;
    return normalized * 0.9;
  }

  if (kind == 2) { // plasmid packet
    if (role == ROLE_GUARDIAN) return -normalized * 0.45;
    if (role == ROLE_ARCHITECT) return -normalized * 0.2;
    if (role == ROLE_PARASITE) return normalized * 0.75;
    return normalized * 0.3;
  }

  return 0.0;
}

function fireSignal(atomIndex: i32): void {
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
const OP_JZ: u8 = 0x10; // JZ Reg, RelAddr
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
const OP_SPORE_DRIVE: u8 = 0xAA;
const OP_ENTANGLE: u8 = 0xAB;
const SPORE_DRIVE_COST: i32 = 500;
const ENTANGLE_LOW_ENERGY: i32 = 500;
const ENTANGLE_MAX_DRAW: i32 = 400;
const ENTANGLE_SPIN_LIMIT: i32 = 16;

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

function lcgNext(seed: u32): u32 {
  return seed * 1664525 + 1013904223;
}

function genomePoolSlot(atomIdx: i32): i32 {
  let hash: u32 = 2166136261;
  for (let i = 0; i < 8; i++) {
    hash = (hash ^ (getLogicByte(atomIdx, i) as u32)) * 16777619;
  }
  return (hash & 255) as i32;
}

function getReg(atomIdx: i32, reg: i32): i32 {
  return load<i32>(CONTEXT_OFFSET + (atomIdx << 6) + (reg << 2) as usize);
}
function setReg(atomIdx: i32, reg: i32, val: i32): void {
  store<i32>(CONTEXT_OFFSET + (atomIdx << 6) + (reg << 2) as usize, val);
}
function getPC(atomIdx: i32): u8 {
  return load<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 32 as usize);
}
function setPC(atomIdx: i32, val: u8): void {
  store<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 32 as usize, val);
}
function setBondDist(atomIdx: i32, slot: i32, dist: u8): void {
  store<u8>(BOND_DIST_OFF + (atomIdx << 2) + slot as usize, dist);
}
function setDamping(atomIdx: i32, val: u8): void {
  store<u8>(DAMPING_OFF + atomIdx as usize, val);
}
function getRole(atomIdx: i32): u8 {
  return load<u8>(ROLES_OFFSET + atomIdx as usize);
}
function setRole(atomIdx: i32, val: u8): void {
  store<u8>(ROLES_OFFSET + atomIdx as usize, val);
}
function setHiveMemory(addr: i32, val: u8): void {
  store<u8>(HIVE_MEMORY_OFF + (addr & 1023) as usize, val);
}
function getHiveMemory(addr: i32): u8 {
  return load<u8>(HIVE_MEMORY_OFF + (addr & 1023) as usize);
}
function getHiveBalance(): i32 {
  return atomic.load<i32>(HIVE_BALANCE_OFF);
}
function addHiveBalance(val: i32): i32 {
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

function clampWorldX(x: i32): i32 {
  if (x < 0) return 0;
  if (x > WORLD_MAX_X) return WORLD_MAX_X;
  return x;
}

function clampWorldY(y: i32): i32 {
  if (y < 0) return 0;
  if (y > WORLD_MAX_Y) return WORLD_MAX_Y;
  return y;
}

function storeClampedPos(idx: i32, x: i32, y: i32): void {
  store<i16>(XS_OFFSET + (idx << 1) as usize, clampWorldX(x) as i16);
  store<i16>(YS_OFFSET + (idx << 1) as usize, clampWorldY(y) as i16);
}

function dir4X(n: i32): i32 {
  if (n == 0) return -1;
  if (n == 1) return 1;
  return 0;
}

function dir4Y(n: i32): i32 {
  if (n == 2) return -1;
  if (n == 3) return 1;
  return 0;
}

function dir8X(n: i32): i32 {
  if (n == 0 || n == 4 || n == 6) return -1;
  if (n == 1 || n == 5 || n == 7) return 1;
  return 0;
}

function dir8Y(n: i32): i32 {
  if (n == 2 || n == 4 || n == 5) return -1;
  if (n == 3 || n == 6 || n == 7) return 1;
  return 0;
}

function getGenomeVelocityX(idx: i32): i32 {
  let vx: i32 = 0;
  for (let b = 0; b < 2; b++) {
    let byte = getLogicByte(idx, b);
    let hi = (byte >> 4) as i32;
    if (hi != 0) vx += (hi > 7 ? hi - 7 : hi - 8) * 3;
    let lo = (byte & 0x0F) as i32;
    if (lo != 0) vx += (lo > 7 ? lo - 7 : lo - 8) * 3;
  }
  return vx;
}

function getGenomeVelocityY(idx: i32): i32 {
  let vy: i32 = 0;
  for (let b = 2; b < 4; b++) {
    let byte = getLogicByte(idx, b);
    let hi = (byte >> 4) as i32;
    if (hi != 0) vy += (hi > 7 ? hi - 7 : hi - 8) * 3;
    let lo = (byte & 0x0F) as i32;
    if (lo != 0) vy += (lo > 7 ? lo - 7 : lo - 8) * 3;
  }
  return vy;
}

function calculateTrophism(idx: i32, x: i32, y: i32, role: u8): void {
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
          let d2 = dx * dx + dy * dy;
          if (d2 < 0.001) {
            // Overlapping atoms flow energy but don't apply chemotaxis/avoidance (divide by zero)
            d2 = 0.001; 
          } else if (d2 < 1.0) {
            // Minor overlap, let it through
          }

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
                addEnergyDelta(
                  otherIdx,
                  -Mathf.min(oEnergy as f32, burn as f32) as i32,
                );
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
          if (role == ROLE_PRODUCER && (oEnergy as f32) < 50000.0) {
            multiplier = 2.0; // 50.0 * 1000
          }

          let force = ((oEnergy as f32) / 100000.0) * ((radius - d) / radius) *
            (2.0 * multiplier);
          tx += (dx / d) * force;
          ty += (dy / d) * force;
        }
      }
    }
  }

  // Observer presence field (Era 70): role-dependent response to attention gradients.
  let gradX = getAttentionCell(gx + 1, gy) - getAttentionCell(gx - 1, gy);
  let gradY = getAttentionCell(gx, gy + 1) - getAttentionCell(gx, gy - 1);
  if (gradX > 200.0) gradX = 200.0;
  if (gradX < -200.0) gradX = -200.0;
  if (gradY > 200.0) gradY = 200.0;
  if (gradY < -200.0) gradY = -200.0;

  let attentionDrive: f32 = 0.0;
  if (role == ROLE_PARASITE) {
    attentionDrive = -0.04;
  } else if (role == ROLE_ARCHITECT) {
    const localAttention = getAttentionCell(gx, gy);
    attentionDrive = localAttention > 80.0 ? -0.03 : 0.02;
  } else if (role == ROLE_GUARDIAN) {
    attentionDrive = 0.02;
  } else {
    attentionDrive = 0.05; // Producers and neutral explorers gravitate to attention.
  }
  tx += gradX * attentionDrive;
  ty += gradY * attentionDrive;

  let glyphGradX = getGlyphInfluence(gx + 1, gy, role) -
    getGlyphInfluence(gx - 1, gy, role);
  let glyphGradY = getGlyphInfluence(gx, gy + 1, role) -
    getGlyphInfluence(gx, gy - 1, role);
  if (glyphGradX > 200.0) glyphGradX = 200.0;
  if (glyphGradX < -200.0) glyphGradX = -200.0;
  if (glyphGradY > 200.0) glyphGradY = 200.0;
  if (glyphGradY < -200.0) glyphGradY = -200.0;
  tx += glyphGradX * 0.015;
  ty += glyphGradY * 0.015;

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
        let cell = readStructureCell(cy * 140 + cx);
        let density = (cell >> 8) & 0xFF;
        let force = (255.0 as f32 - (density as f32)) / (50.0 as f32);
        tx += ((ox as f32) / (2.0 as f32)) * force;
        ty += ((oy as f32) / (2.0 as f32)) * force;
      }
    }
  }

  // ERA 71: ACCUMULATE instead of immediate store
  accForceX += tx;
  accForceY += ty;
}

// --- ERA 72: GLYPH INTERNALIZATION ---

@inline
function unpackGlyphKind(header: i32): i32 {
  return header & 0xFF;
}

@inline
function unpackGlyphAmplitude(header: i32): i32 {
  return (header >>> 8) & 0x00FFFFFF;
}

@inline
function packGlyphHeader(kind: i32, amplitude: i32): i32 {
  if (amplitude < 0) amplitude = 0;
  if (amplitude > 0x00FFFFFF) amplitude = 0x00FFFFFF;
  return (amplitude << 8) | (kind & 0xFF);
}

function decayForKind(kind: i32, amplitude: i32): i32 {
  if (kind == 2) { // PLASMID
    return amplitude > 256 ? 3 : 1;
  }
  if (kind == 1) { // PHEROMONE
    return amplitude > 64 ? 8 : 4;
  }
  return amplitude;
}

function diffusionShareForKind(kind: i32, amplitude: i32): i32 {
  if (kind == 2) { // PLASMID
    return amplitude >= 96 ? (amplitude >> 3) : 0; // amplitude * 0.125
  }
  if (kind == 1) { // PHEROMONE
    return amplitude >= 24 ? (amplitude >> 2) : 0; // amplitude * 0.25
  }
  return 0;
}

function atomicDepositGlyphHeader(
  baseOffset: usize,
  cell: i32,
  kind: i32,
  amplitude: i32,
  payloadPtr: usize = 0,
): void {
  if (amplitude <= 0 || cell < 0 || cell >= 140 * 80) return;

  const ptr = (baseOffset + (cell << 2)) as usize;

  for (let spin = 0; spin < 128; spin++) {
    const current = atomic.load<i32>(ptr);
    const currentKind = unpackGlyphKind(current);
    const currentAmplitude = unpackGlyphAmplitude(current);

    if (currentKind != 0 && currentKind != kind) {
      if (amplitude <= currentAmplitude) return;
      const observed = atomic.cmpxchg<i32>(
        ptr,
        current,
        packGlyphHeader(kind, amplitude),
      );
      if (observed == current) {
        if (kind == 2 && payloadPtr != 0) {
          const payloadBase = baseOffset == GLYPH_HEADER_OFF ? GLYPH_PAYLOAD_OFF : GLYPH_SCRATCH_PAYLOAD_OFF;
          const dstPtr = payloadBase + (cell << 3) as usize;
          memory.copy(dstPtr, payloadPtr, 8);
        }
        return;
      }
      continue;
    }

    let nextAmplitude = currentAmplitude + amplitude;
    if (nextAmplitude > 0x00FFFFFF) nextAmplitude = 0x00FFFFFF;
    const observed = atomic.cmpxchg<i32>(
      ptr,
      current,
      packGlyphHeader(kind, nextAmplitude),
    );
    if (observed == current) {
      if (kind == 2 && payloadPtr != 0) {
        const payloadBase = baseOffset == GLYPH_HEADER_OFF ? GLYPH_PAYLOAD_OFF : GLYPH_SCRATCH_PAYLOAD_OFF;
        const dstPtr = payloadBase + (cell << 3) as usize;
        memory.copy(dstPtr, payloadPtr, 8);
      }
      return;
    }
  }
}

function secreteGlyph(
  x: i32,
  y: i32,
  kind: i32,
  intensity: i32,
  role: u8,
  atomIdx: i32 = -1,
  payloadPtr: usize = 0,
): void {
  if (intensity <= 0) return;
  const gx = x / 10;
  const gy = y / 10;
  if (gx < 0 || gx >= 140 || gy < 0 || gy >= 80) return;

  const cell = gy * 140 + gx;

  // Telemetry: increment role-based atomic counter
  if (kind >= 1 && kind <= 2 && role <= 4) {
    const statPtr = SECRETION_STATS_OFF +
      (((kind - 1) * 5 + (role as i32)) << 2) as usize;
    atomic.add<i32>(statPtr, 1);
  }

  // Energy Cost (Stage 5.3)
  if (atomIdx >= 0) {
    let cost: i32 = 0;
    if (kind == 1) cost = PHEROMONE_COST_BASE + (intensity >> 3);
    else if (kind == 2) cost = PLASMID_COST_BASE + (intensity >> 2);
    
    if (cost > 0) {
        const currentEnergy = getEnergy(atomIdx);
        setEnergy(atomIdx, currentEnergy - cost);
    }
  }

  atomicDepositGlyphHeader(GLYPH_HEADER_OFF, cell, kind, intensity, payloadPtr);

  // Halo spill for Pheromones (kind=1)
  if (kind == 1) {
    const spill = intensity >> 2;
    if (spill > 16) {
      if (gx > 0) atomicDepositGlyphHeader(GLYPH_HEADER_OFF, cell - 1, 1, spill);
      if (gx < 139) atomicDepositGlyphHeader(GLYPH_HEADER_OFF, cell + 1, 1, spill);
      if (gy > 0) atomicDepositGlyphHeader(GLYPH_HEADER_OFF, cell - 140, 1, spill);
      if (gy < 79) atomicDepositGlyphHeader(GLYPH_HEADER_OFF, cell + 140, 1, spill);
    }
  }
}


export function tickGlyphTransport(tick: i32): void {
  // Sampling grid for internal reflection (Stage 5.1/5.2)
  memory.fill(GLYPH_SCRATCH_HEADER_OFF, 0, (140 * 80) << 2);
  
  for (let cell = 0; cell < 140 * 80; cell++) {
    const header = load<i32>(GLYPH_HEADER_OFF + (cell << 2) as usize);
    const kind = unpackGlyphKind(header);
    const amplitude = unpackGlyphAmplitude(header);
    if (kind == 0 || amplitude <= 0) continue;

    const decayed = amplitude - decayForKind(kind, amplitude);
    if (decayed <= 0) continue;

    const share = diffusionShareForKind(kind, decayed);
    const retained = decayed - share;
    
    if (retained > 0) {
      atomicDepositGlyphHeader(GLYPH_SCRATCH_HEADER_OFF, cell, kind, retained);
      if (kind == 2) { // PLASMID payload persistence
        const srcPtr = GLYPH_PAYLOAD_OFF + (cell << 3) as usize;
        const dstPtr = GLYPH_SCRATCH_PAYLOAD_OFF + (cell << 3) as usize;
        memory.copy(dstPtr, srcPtr, 8);
      }
    }

    if (share > 0) {
      const gx = cell % 140;
      const gy = cell / 140;
      const selector = (tick + cell) & 3;
      let nextCell = cell;
      
      if (selector == 0 && gx < 139) nextCell = cell + 1;
      else if (selector == 1 && gy < 79) nextCell = cell + 140;
      else if (selector == 2 && gx > 0) nextCell = cell - 1;
      else if (selector == 3 && gy > 0) nextCell = cell - 140;
      
      atomicDepositGlyphHeader(GLYPH_SCRATCH_HEADER_OFF, nextCell, kind, share);
      if (kind == 2) { // PLASMID payload transport
        const srcPtr = GLYPH_PAYLOAD_OFF + (cell << 3) as usize;
        const dstPtr = GLYPH_SCRATCH_PAYLOAD_OFF + (nextCell << 3) as usize;
        memory.copy(dstPtr, srcPtr, 8);
      }
    }
  }

  // 2. Seeding: Internal Reflection (Signal -> Pheromone)
  for (let cell: i32 = 0; cell < 11200; cell++) {
    const signal = atomic.load<i32>(SIGNAL_GRID_OFF + (cell << 2) as usize);
    const absSignal = signal < 0 ? -signal : signal;
    if (absSignal >= 1) {
      let amp = absSignal >> 1;
      if (amp < 16) amp = 16;
      if (amp > 512) amp = 512;
      atomicDepositGlyphHeader(GLYPH_SCRATCH_HEADER_OFF, cell, 1, amp);
      // Quantification (Stage 5.1/5.2) - sample-based to avoid overflow
      if ((cell % 32) == 0) {
        atomic.add<i32>(SECRETION_STATS_OFF + 40, 1); // Signal leak counter
      }
    }
  }

  // 3. Seeding: Internal Reflection (Memory -> Plasmid)
  for (let cell: i32 = 0; cell < 11200; cell++) {
    const memOffset = MEMORY_GRID_OFF + (cell << 3) as usize;
    const memoryLo = atomic.load<u32>(memOffset);
    const charge = memoryLo & 0xFFFFFF; // 24-bit charge

    if (charge >= 1) {
      let amp = charge >> 2;
      if (amp < 24) amp = 24;
      if (amp > 384) amp = 384;
      atomicDepositGlyphHeader(GLYPH_SCRATCH_HEADER_OFF, cell, 2, amp, memOffset);
      // Quantification
      if ((cell % 32) == 0) {
        atomic.add<i32>(SECRETION_STATS_OFF + 44, 1); // Memory leak counter
      }
    }
  }

  memory.copy(GLYPH_PAYLOAD_OFF, GLYPH_SCRATCH_PAYLOAD_OFF, 11200 << 3);
  memory.copy(GLYPH_HEADER_OFF, GLYPH_SCRATCH_HEADER_OFF, 11200 << 2);
}

// --- PER-ROLE SECRETION PREDICATES ---

@inline
function guardianShouldEmitPheromone(tick: i32, idx: i32, phase: i32, resonance: i32): bool {
  if (load<u8>(CAUSALITY_OFF + idx) == 0) return false;
  if (((tick + idx) % 64) != 0) return false;
  return resonance > 300;
}

@inline
function architectShouldEmitPlasmid(tick: i32, idx: i32, phase: i32, resonance: i32, energy: i32): bool {
  if (((tick + idx) % 32) != 0) return false;
  return resonance > 200;
}

@inline
function producerShouldEmitPheromone(tick: i32, idx: i32, phase: i32, resonance: i32, energy: i32): bool {
  if (((tick + idx) % 128) != 0) return false;
  return resonance > 400;
}

@inline
function producerShouldEmitPlasmid(tick: i32, idx: i32, phase: i32, resonance: i32, energy: i32): bool {
  if (((tick + idx) % 128) != 0) return false;
  return energy > 800;
}

@inline
function neutralShouldEmitPheromone(tick: i32, idx: i32, phase: i32, resonance: i32): bool {
  if (((tick + idx) % 256) != 0) return false;
  return resonance > 500;
}


function applyBondSprings(idx: i32, x: i32, y: i32): void {
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
    let dist = Mathf.sqrt(dx * dx + dy * dy);
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

  // ERA 71: ACCUMULATE instead of immediate store
  accForceX += fx;
  accForceY += fy;
}

export function execute_atom(atomIndex: i32): void {
  if (atomIndex < 20) {
    const rawRole = load<u8>(ROLES_OFFSET + (atomIndex as usize));
    const rawRes = load<i32>(RESONANCE_OFFSET + (atomIndex << 2) as usize);
    const rawTick = load<i32>(TICK_COUNTER_OFF);
    trace_atom(atomIndex, 0xAA, rawRes, rawTick, rawRole as i32);
  }
  let id = load<u64>(IDS_OFFSET + (atomIndex << 3) as usize);
  let curX = getReadX(atomIndex) as i32;
  let curY = getReadY(atomIndex) as i32;
  let role = getRole(atomIndex);

  // --- VECTOR 7: THE QUANTUM SHIFT ---
  // If id > 10, calculate physics (matching JS neural verification)
  if (id > 10) {
    // ERA 71: Reset accumulation
    accForceX = 0;
    accForceY = 0;
    
    let vx = getGenomeVelocityX(atomIndex);
    let vy = getGenomeVelocityY(atomIndex);
    let energy = getEnergy(atomIndex);
    let phase = getPhase(atomIndex);
    let res = getResonance(atomIndex);
    const tick = load<i32>(TICK_COUNTER_OFF);
    const cell = (curY / 10) * 140 + (curX / 10);

    // DECENTRALIZED SECRETION (Stage 5.2: coord-based + spill)
    if (role == ROLE_GUARDIAN && guardianShouldEmitPheromone(tick, atomIndex, phase, res)) {
      secreteGlyph(curX, curY, 1, clampResource(res / 4) as i32, role, atomIndex);
    } else if (role == ROLE_ARCHITECT && architectShouldEmitPlasmid(tick, atomIndex, phase, res, energy)) {
      secreteGlyph(curX, curY, 2, clampResource((energy + res) / 10) as i32, role, atomIndex, LOGIC_OFFSET + (atomIndex << 3));
    } else if (role == ROLE_PRODUCER) {
      if (producerShouldEmitPheromone(tick, atomIndex, phase, res, energy)) {
        secreteGlyph(curX, curY, 1, clampResource((res + energy) / 10) as i32, role, atomIndex);
      }
      if (producerShouldEmitPlasmid(tick, atomIndex, phase, res, energy)) {
        secreteGlyph(curX, curY, 2, clampResource((energy + res) / 12) as i32, role, atomIndex, LOGIC_OFFSET + (atomIndex << 3));
      }
    } else if (role == ROLE_NEUTRAL && neutralShouldEmitPheromone(tick, atomIndex, phase, res)) {
      secreteGlyph(curX, curY, 1, clampResource(res / 8) as i32, role, atomIndex);
    } else if (role == ROLE_PARASITE && (tick % 64) == 0) {
      secreteGlyph(curX, curY, 2, 32, role, atomIndex, LOGIC_OFFSET + (atomIndex << 3));
    }

    applyBondSprings(atomIndex, curX, curY);
    calculateTrophism(atomIndex, curX, curY, role);

    // Final position integration (velocity + forces)
    let damping = load<u8>(DAMPING_OFF + atomIndex as usize);
    // HORMONE 1: time_viscosity lowers effective dampingFactor (range 0..2048 → 0..0.15 additive)
    let viscosityH: f32 = getHormone(1) as f32 / 2048.0;
    let dampingFactor = Mathf.max(0, 1.0 - (damping as f32) / 255.0 - viscosityH * 0.15);

    // Behavior velocity is added on top of force integration
    let nextX = (curX as f32) + accForceX +
      (vx as f32) * 2.0 * (dampingFactor as f32);
    let nextY = (curY as f32) + accForceY +
      (vy as f32) * 2.0 * (dampingFactor as f32);

    storeClampedPos(atomIndex, Math.round(nextX) as i32, Math.round(nextY) as i32);
  }

  let pc = getPC(atomIndex);
  let energy = getReadEnergy(atomIndex);
  let resonance = getReadResonance(atomIndex);
  const instr_base: usize = INSTRUCTIONS_OFFSET + (atomIndex << 6) as usize;

  // Safety: Dynamic steps per tick max to prevent infinite loops (8..24 range)
  let viscosityH: i32 = getHormone(1) as i32;
  let maxSteps: i32 = 24 - (viscosityH >> 7); // 24..8
  if (maxSteps < 8) maxSteps = 8;

  let step: i32 = 0;
  while (step < maxSteps) {
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
        else if (prop == PROP_GRID_CHARGE) {
          let rx = getX(atomIndex) as i32;
          let ry = getY(atomIndex) as i32;
          let gx = rx / 10;
          let gy = ry / 10;
          if (gx >= 0 && gx < 140 && gy >= 0 && gy < 80) {
            val = readStructureCharge(gy * 140 + gx);
          }
        } else if (prop == PROP_QUORUM) {
          let rx = getX(atomIndex) as i32;
          let ry = getY(atomIndex) as i32;
          let gx = rx / 10;
          let gy = ry / 10;
          if (gx >= 0 && gx < 140 && gy >= 0 && gy < 80) {
            val = getSpatialGridCount(gx, gy);
          }
        } else if (prop == PROP_NEURAL_COHERENCE) {
          val = atomic.load<i32>(NEURAL_COHERENCE_OFF);
        } else if (prop == PROP_MEMORY) {
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
        setReg(
          atomIndex,
          r1 as i32,
          getReg(atomIndex, r1 as i32) + getReg(atomIndex, r2 as i32),
        );
        pc += 3;
        break;
      }
      case OP_SUB: {
        let r1 = load<u8>(instr_base + (pc + 1) as usize);
        let r2 = load<u8>(instr_base + (pc + 2) as usize);
        setReg(
          atomIndex,
          r1 as i32,
          getReg(atomIndex, r1 as i32) - getReg(atomIndex, r2 as i32),
        );
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
        // HORMONE 3: replication_bias lowers thresholds (range 0..2048 → up to -512 energy / -100 resonance)
        let biasH: i32 = getHormone(3) as i32;
        let replicateEThresh: i32 = 1500 - (biasH >> 2); // 1500..988
        let replicateRThresh: i32 = 200 - (biasH >> 4);  // 200..72
        if (energy > replicateEThresh && resonance > replicateRThresh) {
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
            let parentGenome = load<u64>(
              (LOGIC_OFFSET + (atomIndex << 3) as usize) as usize,
            );
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
          let bonus = (currentResonance / 10) > 55
            ? 55
            : (currentResonance / 10);
          let nextCharge = 200 + bonus;
          publishChargeIntent(cellIdx, nextCharge);
        }
        secreteGlyph(rx, ry, 1, 64, role, atomIndex); // OP_SIGNAL pulses Pheromones
        fireSignal(atomIndex); // Also fire biological signal to neighbors
        pc += 1;
        break;
      }
      case OP_PLUG: {
        let mode = load<u8>(instr_base + (pc + 1) as usize);
        let reg = load<u8>(instr_base + (pc + 2) as usize);
        let gx = (getX(atomIndex) as i32) / 10;
        let gy = (getY(atomIndex) as i32) / 10;
        let gridIdx = (gy * 140 + gx) as usize;

        if (mode == 0) { // READ CHARGE
          let charge = readStructureCharge(gridIdx as i32);
          setReg(atomIndex, reg as i32, charge);
          trace_atom(atomIndex, 0xA4, gx, gy, charge);
        } else if (mode == 1) { // WRITE CHARGE
          let charge = getReg(atomIndex, reg as i32) & 0xFF;
          publishChargeIntent(gridIdx as i32, charge);
          energy -= 10;
        }
        pc += 3;
        break;
      }
      case OP_TENSEGRITY: {
        let mode = load<u8>(instr_base + (pc + 1) as usize);
        let p2 = load<u8>(instr_base + (pc + 2) as usize);
        let p3 = load<u8>(instr_base + (pc + 3) as usize);

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
        let p2 = load<u8>(instr_base + (pc + 2) as usize);
        let p3 = load<u8>(instr_base + (pc + 3) as usize);

        if (mode == 0) { // HIVE_STORE addr, val
          setHiveMemory(p2 as i32, p3);
        } else if (mode == 1) { // HIVE_LOAD addr, reg
          setReg(atomIndex, p3 as i32, getHiveMemory(p2 as i32) as i32);
        } else if (mode == 2) { // PHEROMONE_EMIT intensity
          let rx = getX(atomIndex) as i32;
          let ry = getY(atomIndex) as i32;
          secreteGlyph(rx, ry, 1, p2 as i32, role, atomIndex);
        } else if (mode == 7) { // PLASMID_EMIT intensity
          let rx = getX(atomIndex) as i32;
          let ry = getY(atomIndex) as i32;
          secreteGlyph(rx, ry, 2, p2 as i32, role, atomIndex, LOGIC_OFFSET + (atomIndex << 3));
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
            if (
              neighborIdx != atomIndex && neighborIdx >= 0 &&
              neighborIdx < MAX_ATOMS
            ) {
              setPC(neighborIdx, pc + 4); // Set neighbor to next instruction
            }
          }
        }
        pc += 4;
        break;
      }
      case OP_ROLE: {
        let mode = load<u8>(instr_base + (pc + 1) as usize);
        let val = load<u8>(instr_base + (pc + 2) as usize);
        if (mode == 0) {
          setRole(atomIndex, val);
          role = val;
        }
        pc += 3;
        break;
      }
      case OP_SHARE: { // SHARE_ENERGY slot, percentage
        const slot = load<u8>(instr_base + pc as usize + 1) & 3;
        let percentage = load<u8>(instr_base + pc as usize + 2) as i32;
        // HORMONE 2: aggression scales the share percentage (range 0..2048; >1024 adds +10%)
        let aggrH: i32 = getHormone(2) as i32;
        if (aggrH > 1024) percentage += 10;
        
        let targetIdx = getBondTarget(atomIndex, slot);
        if (targetIdx > 0 && targetIdx < MAX_ATOMS) {
          let amount = (energy * percentage) / 100;
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
              let newVal = ((state as i32) << 24) | ((type as i32) & 0xFF);
              publishBuildIntent(cellIdx, atomIndex, newVal);
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
            let cellVal = readStructureCell(ni);
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
      case OP_SPORE_DRIVE: {
        if (energy >= SPORE_DRIVE_COST) {
          energy -= SPORE_DRIVE_COST;

          const idPtr = IDS_OFFSET + (atomIndex << 3) as usize;
          const idLo = load<u32>(idPtr);
          const idHi = load<u32>(idPtr + 4);
          const tick = atomic.load<i32>(TICK_COUNTER_OFF as usize) as u32;
          const phaseBits = getPhase(atomIndex) as u32;
          const genomeHead = ((getLogicByte(atomIndex, 0) as u32) << 8) |
            (getLogicByte(atomIndex, 1) as u32);

          let seed = idLo ^ (idHi << 1) ^ (tick * 2246822519) ^
            (phaseBits * 3266489917) ^ genomeHead;
          seed = lcgNext(seed);
          const targetX = (seed % 1400) as i32;
          seed = lcgNext(seed ^ (genomeHead << 16));
          const targetY = (seed % 800) as i32;

          const gx = targetX / 10;
          const gy = targetY / 10;
          const cellIdx = gy * 140 + gx;
          const cellType = readStructureCell(cellIdx) & 0xFF;
          if (cellType == STR_VOID) {
            storeClampedPos(atomIndex, targetX, targetY);
          }
        }
        pc += 1;
        break;
      }
      case OP_ENTANGLE: {
        const slot = genomePoolSlot(atomIndex);
        const poolPtr = HIVE_ENERGY_POOL_OFF + (slot << 2) as usize;
        if (energy > ENTANGLE_LOW_ENERGY) {
          const deposit = energy / 10;
          if (deposit > 0) {
            energy -= deposit;
            atomic.add<i32>(poolPtr, deposit);
          }
        } else {
          let draw = ENTANGLE_LOW_ENERGY - energy;
          if (draw > ENTANGLE_MAX_DRAW) draw = ENTANGLE_MAX_DRAW;
          if (draw < 1) draw = 1;

          for (let spin = 0; spin < ENTANGLE_SPIN_LIMIT; spin++) {
            const snapshot = atomic.load<i32>(poolPtr);
            if (snapshot <= 0) break;
            const take = snapshot < draw ? snapshot : draw;
            const observed = atomic.cmpxchg<i32>(
              poolPtr,
              snapshot,
              snapshot - take,
            );
            if (observed == snapshot) {
              energy += take;
              break;
            }
          }
        }
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
    step += 1;
  }
  setPC(atomIndex, pc);

  // HORMONE 0: entropy_pressure scales metabolic cost (range 0..2048 → +0..+4 per executed step)
  let entropyH: i32 = getHormone(0) as i32;
  // HORMONE 5: mutation_friction adds a metabolic floor (range 0..2048 → +0..+8 per execute)
  let frictionH: i32 = getHormone(5) as i32;
  let metabolicCost = 1 + (step >> 1) + ((step * entropyH) >> 12) + (frictionH >> 8);

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

  // HORMONE 4: repair_drive slows resonance decay (range 0..2048; >1024 halves decay)
  let repairH: i32 = getHormone(4) as i32;
  let resonanceDecay: i32 = repairH > 1024 ? 1 : 2;
  if (resonance > 0) setResonance(atomIndex, resonance - resonanceDecay);
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
let spatialHashOverflowCount: i32 = 0;
let spatialHashMaxCellCount: i32 = 0;

export function get_spatial_hash_overflow_count(): i32 {
  return spatialHashOverflowCount;
}

export function get_spatial_hash_max_cell_count(): i32 {
  return spatialHashMaxCellCount;
}

export function build_spatial_hash(): void {
  const GRID_COLS: i32 = 140;
  const GRID_ROWS: i32 = 80;
  const TOTAL_CELLS: i32 = 11200; // 140 * 80
  const CELL_CAPACITY: i32 = 31;
  const MAX_ATOM_SLOTS: i32 = CELL_CAPACITY - 1;

  spatialHashOverflowCount = 0;
  spatialHashMaxCellCount = 0;

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
    if (x < 0) x = 0;
    if (x > 1399) x = 1399;
    if (y < 0) y = 0;
    if (y > 799) y = 799;

    let cellX = x / 10;
    let cellY = y / 10;
    let cellIdx = cellY * GRID_COLS + cellX;
    let offset = SPATIAL_GRID_OFFSET + (cellIdx << 7);

    // Atomic update of count
    let nextSlot = atomic.add<i32>(offset as usize, 1) + 1;
    if (nextSlot <= MAX_ATOM_SLOTS) {
      store<i32>((offset + (nextSlot << 2)) as usize, idx);

      // Phase tracking (Era 50)
      let myPhase = getPhase(idx);
      atomic.add<i32>((offset + (CELL_CAPACITY << 2)) as usize, myPhase);

      // Role quorum (Era 55)
      let role = getRole(idx);
      let safeRole = role > 7 ? 7 : role;
      atomic.add<i32>(
        QUORUM_OFFSET + (cellIdx << 5) + (safeRole << 2) as usize,
        1,
      );
      if (nextSlot > spatialHashMaxCellCount) {
        spatialHashMaxCellCount = nextSlot;
      }
    } else {
      // Overflow: roll back count so the cell occupancy stays bounded.
      atomic.sub<i32>(offset as usize, 1);
      spatialHashOverflowCount += 1;
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
      const cellPtr = STRUCTURE_GRID_OFF + (i << 2);
      const ownerPtr = STRUCTURE_BUILD_OWNER_OFF + (i << 2) as usize;
      const valuePtr = STRUCTURE_BUILD_VALUE_OFF + (i << 2) as usize;
      const chargeIntentPtr = STRUCTURE_CHARGE_INTENT_OFF + (i << 2) as usize;

      let cellVal = atomic.load<i32>(cellPtr);
      const ownerRaw = atomic.load<i32>(ownerPtr);
      const owner = ownerRaw & STRUCTURE_INTENT_OWNER_MASK;
      if (owner != 0) {
        cellVal = atomic.load<i32>(valuePtr);
      }
      const intentChargeRaw = atomic.load<i32>(chargeIntentPtr);
      if (intentChargeRaw > 0) {
        let intentCharge = intentChargeRaw;
        if (intentCharge > 255) intentCharge = 255;
        const baseCharge = (cellVal >> 16) & 0xFF;
        if (intentCharge > baseCharge) {
          cellVal = (cellVal & ~0x00FF0000) | (intentCharge << 16);
        }
      }
      if (ownerRaw != 0 || intentChargeRaw != 0) {
        atomic.store<i32>(cellPtr, cellVal);
        if (ownerRaw != 0) {
          atomic.store<i32>(ownerPtr, 0);
          atomic.store<i32>(valuePtr, 0);
        }
        if (intentChargeRaw != 0) {
          atomic.store<i32>(chargeIntentPtr, 0);
        }
      }

      let type = cellVal & 0xFF;
      let currentCharge = (cellVal >> 16) & 0xFF;
      if (type < STR_VOID || type > STR_CAPACITOR) {
        if (currentCharge < 64) currentCharge = 64;
        cellVal = (cellVal & ~0x00FFFF00) | (currentCharge << 16) | STR_WIRE;
        atomic.store<i32>(STRUCTURE_GRID_OFF + (i << 2), cellVal);
        type = STR_WIRE;
      }

      // --- AUTOPOIESIS: Spontaneous Crystallization ---
      if (type == STR_VOID) {
        let maxNCharge: i32 = currentCharge;
        for (let n = 0; n < 8; n++) {
          let nx = x + dir8X(n);
          let ny = y + dir8Y(n);
          if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
            let ni = ny * GRID_W + nx;
            let nCharge = readStructureCharge(ni);
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
      } else if (
        type == STR_WIRE || type == STR_NODE || type == STR_CAPACITOR
      ) {
        let maxNeighborCharge: i32 = 0;
        let chargedCount: i32 = 0;

        for (let n = 0; n < 4; n++) {
          let nx = x + dir4X(n);
          let ny = y + dir4Y(n);
          if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
            let ni = ny * GRID_W + nx;
            let nCharge = readStructureCharge(ni);
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
        let nx = x;
        let ny = y;
        if (state == 0) nx--;
        else if (state == 1) nx++;
        else if (state == 2) ny--;
        else if (state == 3) ny++;

        if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
          let ni = ny * GRID_W + nx;
          let nCharge = readStructureCharge(ni);
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
            let nCharge = readStructureCharge(ni);
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

      atomic.store<i32>(
        STRUCTURE_GRID_OFF + (i << 2),
        (cellVal & ~0x00FF0000) | (nextCharge << 16),
      );
    }
  }
}

// Deprecated in favor of tick_structure_grid, kept for legacy compatibility if needed
export function tick_matrix(): void {
  tick_structure_grid();
}

export function reduce_atom_deltas(startIdx: i32, endIdx: i32): void {
  let start = startIdx;
  let end = endIdx;
  if (start < 0) start = 0;
  if (end > MAX_ATOMS) end = MAX_ATOMS;
  if (start >= end) return;

  for (let idx = start; idx < end; idx++) {
    const deltaOff = (idx << 2) as usize;

    const de = atomic.load<i32>(ENERGY_DELTA_OFF + deltaOff);
    if (de != 0) {
      atomic.store<i32>(ENERGY_DELTA_OFF + deltaOff, 0);
      const nextEnergy = (atomic.load<i32>(ENERGY_OFFSET + deltaOff) as i64) +
        (de as i64);
      atomic.store<i32>(ENERGY_OFFSET + deltaOff, clampResource(nextEnergy));
    }

    const dr = atomic.load<i32>(RESONANCE_DELTA_OFF + deltaOff);
    if (dr != 0) {
      atomic.store<i32>(RESONANCE_DELTA_OFF + deltaOff, 0);
      const nextRes = (atomic.load<i32>(RESONANCE_OFFSET + deltaOff) as i64) +
        (dr as i64);
      atomic.store<i32>(RESONANCE_OFFSET + deltaOff, clampResource(nextRes));
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

export function clear_secretion_stats(): void {
  memory.fill(SECRETION_STATS_OFF, 0, 40);
}
