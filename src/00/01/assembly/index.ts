// deno-lint-ignore-file
// @ts-nocheck
// OMEGA-64 | assembly/index.ts | Zero-Allocation WASM VM Core

import {
  SIN_LUT, COS_LUT, MAX_ATOMS, SAFETY_BUFFER, TICK_COUNTER_OFF, IDS_OFFSET,
  XS_OFFSET, YS_OFFSET, ENERGY_OFFSET, RESONANCE_OFFSET, PHASE_OFFSET,
  LOGIC_OFFSET, BONDS_OFFSET, STIFFNESS_OFFSET, INSTRUCTIONS_OFFSET, CONTEXT_OFFSET,
  EVOLUTION_OFFSET, INTENT_OFFSET, BOND_REQUESTS_OFFSET, SPATIAL_GRID_OFFSET,
  ROLES_OFFSET, STRUCTURE_GRID_OFF, SIGNAL_GRID_OFF, MEMORY_GRID_OFF,
  ASCENSION_STATS_OFF, BOND_DIST_OFF, DAMPING_OFF, CAUSALITY_OFF,
  HIVE_MEMORY_OFF, HIVE_BALANCE_OFF, QUORUM_OFFSET, SPAWN_REQUESTS_OFF,
  SPAWN_GRID_OFF, COHERENCE_OFF, NEURAL_COHERENCE_OFF, PHYSICS_READ_XS_OFF,
  PHYSICS_READ_YS_OFF, PHYSICS_READ_ENERGY_OFF, PHYSICS_READ_RESONANCE_OFF,
  ENERGY_DELTA_OFF, RESONANCE_DELTA_OFF, STRUCTURE_BUILD_OWNER_OFF,
  STRUCTURE_BUILD_VALUE_OFF, STRUCTURE_CHARGE_INTENT_OFF, ATTENTION_FIELD_OFF,
  HIVE_ENERGY_POOL_OFF, GLYPH_HEADER_OFF, GLYPH_PAYLOAD_OFF,
  GLYPH_SCRATCH_HEADER_OFF, GLYPH_SCRATCH_PAYLOAD_OFF, HORMONE_OFF,
  SECRETION_STATS_OFF, LINEAGE_OFFSET, MEIOSIS_OFFSET, METABOLISM_SCRATCH_OFF,
  SPAWN_MAX, SPAWN_SLOT, SPAWN_HEAD_OFF, SPAWN_DATA_OFF, GENOMES_OFFSET,
  GRID_W, GRID_H, GRID_CELLS
} from "./constants.assembly";

declare function trace_atom(
  idx: i32,
  opcode: i32,
  gx: i32,
  gy: i32,
  targetIdx: i32,
): void;


export function math_sin(angle: i32, highRes: i32): i32 {
  if (highRes == 0) {
    let idx = angle & 255;
    return SIN_LUT[idx] as i32;
  }
  let idx = (angle >> 8) & 255;
  let frac = angle & 255;
  if (highRes == 1) { // LERP
    let v0 = SIN_LUT[idx] as i32;
    let v1 = SIN_LUT[(idx + 1) & 255] as i32;
    return v0 + (((v1 - v0) * frac) >> 8);
  }
  // TAYLOR2
  let s_base = SIN_LUT[idx] as i32;
  let c_base = COS_LUT[idx] as i32;
  let d1 = (c_base * 804) >> 15;
  let term1 = (d1 * frac) >> 8;
  let d2 = (s_base * 10) >> 15;
  let term2 = (d2 * frac * frac) >> 16;
  return s_base + term1 - term2;
}

export function math_cos(angle: i32, highRes: i32): i32 {
  if (highRes == 0) {
    let idx = angle & 255;
    return COS_LUT[idx] as i32;
  }
  let idx = (angle >> 8) & 255;
  let frac = angle & 255;
  if (highRes == 1) { // LERP
    let v0 = COS_LUT[idx] as i32;
    let v1 = COS_LUT[(idx + 1) & 255] as i32;
    return v0 + (((v1 - v0) * frac) >> 8);
  }
  // TAYLOR2
  let s_base = SIN_LUT[idx] as i32;
  let c_base = COS_LUT[idx] as i32;
  let d1 = (s_base * 804) >> 15;
  let term1 = (d1 * frac) >> 8;
  let d2 = (c_base * 10) >> 15;
  let term2 = (d2 * frac * frac) >> 16;
  return c_base - term1 - term2;
}
const RESOURCE_MAX: i32 = 2000000000;

// Genomes are at the start of instructions

// Crystal type constants
const CRYSTAL_OSCILLATOR: i32 = 5;

const CRYSTAL_MEME: i32 = 10; // Type for memetic nodes
const MEME_TRANSFER_PROB: i32 = 8; // ~12.5% chance per tick for meme absorption
const MAX_ASCENSIONS: i32 = 64;
const PHEROMONE_COST_BASE: i32 = 10;
const PLASMID_COST_BASE: i32 = 25;

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
  store<i32>(ENERGY_OFFSET + (idx << 2) as usize, val);
}

function genomeKey16(idx: i32): i32 {
  const ptr = (LOGIC_OFFSET + (idx << 3)) as usize;
  const b0 = load<u8>(ptr) as i32;
  const b1 = load<u8>(ptr + 1) as i32;
  return (b0 << 8) | b1;
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
function getLineage(idx: i32): u64 {
  return load<u64>(LINEAGE_OFFSET + (idx << 3) as usize);
}
function addResonance(idx: i32, delta: i32): void {
  setResonance(idx, getResonance(idx) + delta);
}

// Read a global hormone value from the shared lattice (index 0..6).
// 0=entropy_pressure 1=time_viscosity 2=aggression 3=replication_bias 4=repair_drive 5=mutation_friction 6=global_consensus

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
  store<i32>((offset + 4) as usize, target + 1);
  store<i32>((offset + 8) as usize, 1); // Status: Active
}

function getSpatialGridCount(gx: i32, gy: i32): i32 {
  let cellIdx = gy * GRID_W + gx;
  return load<i32>(SPATIAL_GRID_OFFSET + (cellIdx << 7) as usize);
}
function getSpatialGridAtom(gx: i32, gy: i32, subIdx: i32): i32 {
  let cellIdx = gy * GRID_W + gx;
  return load<i32>(
    SPATIAL_GRID_OFFSET + (cellIdx << 7) + ((subIdx + 1) << 2) as usize,
  );
}

function findNextFreeSlot(start: i32): i32 {
  for (let i = 0; i < MAX_ATOMS; i++) {
    const idx = (start + i) % MAX_ATOMS;
    const idPtr = IDS_OFFSET + (idx << 3) as usize;
    if (load<i64>(idPtr) == 0) return idx;
  }
  return -1;
}

function seed_atom(
  idx: i32,
  id: i64,
  x: i32,
  y: i32,
  energy: i32,
  resonance: i32,
  genomePtr: usize,
  lineagePtr: usize,
): void {
  const idPtr = IDS_OFFSET + (idx << 3) as usize;
  store<i64>(idPtr, id);

  const xPtr = XS_OFFSET + (idx << 1) as usize;
  store<i16>(xPtr, x as i16);

  const yPtr = YS_OFFSET + (idx << 1) as usize;
  store<i16>(yPtr, y as i16);

  store<i32>(ENERGY_OFFSET + (idx << 2) as usize, energy);
  store<i32>(RESONANCE_OFFSET + (idx << 2) as usize, resonance);
  store<i32>(PHASE_OFFSET + (idx << 2) as usize, 0);
  store<u8>(ROLES_OFFSET + (idx as usize), 0);

  const logicPtr = LOGIC_OFFSET + (idx << 3) as usize;
  if (genomePtr != 0) {
    memory.copy(logicPtr, genomePtr, 8);
  } else {
    for (let b = 0; b < 8; b++) store<u8>(logicPtr + b, 0);
  }

  const linOff = LINEAGE_OFFSET + (idx << 3) as usize;
  if (lineagePtr != 0) {
    memory.copy(linOff, lineagePtr, 8);
  } else {
    store<i64>(linOff, 0);
  }

  // Clear instructions and context
  const instPtr = INSTRUCTIONS_OFFSET + (idx << 6) as usize;
  const ctxPtr = CONTEXT_OFFSET + (idx << 6) as usize;
  for (let b = 0; b < 64; b++) {
    store<u8>(instPtr + b, 0);
    store<u8>(ctxPtr + b, 0);
  }
}

export function resolve_bond_requests(start: i32, end: i32): i32 {
  let resolved: i32 = 0;
  for (let i = start; i < end; i++) {
    const ptr = BOND_REQUESTS_OFFSET + (i * 12) as usize;
    const initiatorPlus1 = atomic.load<i32>(ptr);
    if (initiatorPlus1 == 0) continue;

    if (atomic.load<i32>(ptr + 8) != 1) { // Not active
      atomic.store<i32>(ptr, 0);
      continue;
    }

    const targetPlus1 = atomic.load<i32>(ptr + 4);
    const initiator = initiatorPlus1 - 1;
    const target = targetPlus1 - 1;

    if (target >= 0 && target < MAX_ATOMS) {
      trace_atom(initiator, 0xBB, target, 0, resolved);
      setBondTarget(initiator, 0, target);
      setBondStiffness(initiator, 0, 0.1);
      setBondTarget(target, 1, initiator);
      setBondStiffness(target, 1, 0.1);
      trace_atom(initiator, 0xCC, getBondTarget(initiator, 0), 0, 0);
      resolved++;
    }

    // Clear request
    atomic.store<i32>(ptr, 0);
    atomic.store<i32>(ptr + 4, 0);
    atomic.store<i32>(ptr + 8, 0);
  }
  trace_atom(888, 0xEE, resolved, 0, 0);
  return resolved;
}

export function drain_spawn_requests(tick: i32): i32 {
  const writeHead = atomic.load<i32>(SPAWN_HEAD_OFF);
  const readHead = atomic.load<i32>(SPAWN_HEAD_OFF + 4);

  let cursor = readHead;
  const writeCursor = writeHead; // Don't modulo here, we modulo access
  let spawned: i32 = 0;
  let freeSearchCursor: i32 = 0;

  while (cursor != writeCursor && spawned < 64) {
    const slotOff = SPAWN_DATA_OFF +
      ((cursor % SPAWN_MAX) * SPAWN_SLOT) as usize;
    const gLo = load<i32>(slotOff);
    if (gLo != 0) {
      const cx = load<i16>(slotOff + 8) as i32;
      const cy = load<i16>(slotOff + 10) as i32;
      const energyScaled = load<i32>(slotOff + 12);

      const freeIdx = findNextFreeSlot(freeSearchCursor);
      if (freeIdx != -1) {
        const childId = (tick as i64) << 32 | (freeIdx as i64);
        seed_atom(
          freeIdx,
          childId,
          cx,
          cy,
          energyScaled,
          100,
          slotOff,
          slotOff + 16,
        );
        freeSearchCursor = (freeIdx + 1) % MAX_ATOMS;
      }
    }
    cursor++;
    spawned++;
  }

  atomic.store<i32>(SPAWN_HEAD_OFF + 4, cursor);
  return spawned;
}
function getAttentionCell(gx: i32, gy: i32): f32 {
  if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return 0.0;
  return load<f32>(ATTENTION_FIELD_OFF + ((gy * GRID_W + gx) << 2) as usize);
}

function getGlyphInfluence(gx: i32, gy: i32, role: u8): f32 {
  if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return 0.0;
  const cell = gy * GRID_W + gx;
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
const OP_JNZ: u8 = 0x11; // JNZ Reg, RelAddr
const OP_JMP: u8 = 0x12; // JMP RelAddr
const OP_SYSCALL: u8 = 0x60;
const OP_RESOLVE: u8 = 0xB0;
const OP_RESONATE_KURAMOTO: u8 = 0xB1;
const OP_SENSE: u8 = 0xB2;
const OP_SPORE_DRIVE: u8 = 0xA8;

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
const PROP_CONSENSUS: u8 = 11;

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
function getPendingSyscall(atomIdx: i32): u8 {
  return load<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 33 as usize);
}
function setPendingSyscall(atomIdx: i32, val: u8): void {
  store<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 33 as usize, val);
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
      if (cx >= 0 && cx < GRID_W && cy >= 0 && cy < GRID_H) {
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

          // Hard cap on chemotactic force to prevent physics explosions
          // when arbitrary massive energy pools are assigned by the test runner.
          if (force < -20.0) force = -20.0;
          if (force > 20.0) force = 20.0;

          // Anti-overshoot mechanism: Do not pull an atom past its target
          if (force > 0.0 && force > d) {
            force = d;
          }

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
      if (cx >= 0 && cx < GRID_W && cy >= 0 && cy < GRID_H) {
        let cell = readStructureCell(cy * GRID_W + cx);
        let density = (cell >> 8) & 0xFF;
        let force = (255.0 as f32 - (density as f32)) / (50.0 as f32);
        tx += ((ox as f32) / (2.0 as f32)) * force;
        ty += ((oy as f32) / (2.0 as f32)) * force;
      }
    }
  }

  // ACCUMULATE instead of immediate store
  accForceX += tx;
  accForceY += ty;
}

function unpackGlyphKind(header: i32): i32 {
  return header & 0xFF;
}

function unpackGlyphAmplitude(header: i32): i32 {
  return header >> 8; // Signed arithmetic shift (top 24 bits)
}

function packGlyphHeader(kind: i32, amplitude: i32): i32 {
  if (amplitude < -8388608) amplitude = -8388608;
  if (amplitude > 8388607) amplitude = 8388607;
  return (amplitude << 8) | (kind & 0xFF);
}

function decayForKind(kind: i32, amplitude: i32): i32 {
  const absAmp = Math.abs(amplitude) as i32;
  let decayAmt = 0;
  if (kind == 2) { // PLASMID
    decayAmt = absAmp > 256 ? 3 : 1;
  } else if (kind == 1) { // PHEROMONE
    decayAmt = absAmp > 64 ? 8 : 4;
  } else {
    decayAmt = absAmp; // Fallback
  }
  return amplitude > 0 ? decayAmt : -decayAmt;
}

function diffusionShareForKind(kind: i32, amplitude: i32): i32 {
  const absAmp = Math.abs(amplitude) as i32;
  let shareAmt = 0;
  if (kind == 2) { // PLASMID
    shareAmt = absAmp >= 96 ? (absAmp >> 3) : 0; // * 0.125
  } else if (kind == 1) { // PHEROMONE
    shareAmt = absAmp >= 24 ? (absAmp >> 2) : 0; // * 0.25
  }
  return amplitude > 0 ? shareAmt : -shareAmt;
}

function atomicDepositGlyphHeader(
  baseOffset: usize,
  cell: i32,
  kind: i32,
  amplitude: i32,
  payloadPtr: usize = 0,
): void {
  // 0 amplitude wave has no effect
  if (amplitude == 0 || cell < 0 || cell >= (GRID_CELLS as i32)) return;

  const ptr = (baseOffset + (cell << 2)) as usize;

  for (let spin = 0; spin < 128; spin++) {
    const current = atomic.load<i32>(ptr);
    const currentKind = unpackGlyphKind(current);
    const currentAmplitude = unpackGlyphAmplitude(current);

    // Mismatched kind: standard replacement strategy but with absolute power checks
    if (currentKind != 0 && currentKind != kind) {
      if (Math.abs(amplitude) <= Math.abs(currentAmplitude)) return;
      const observed = atomic.cmpxchg<i32>(
        ptr,
        current,
        packGlyphHeader(kind, amplitude),
      );
      if (observed == current) {
        if (kind == 2 && payloadPtr != 0) {
          const payloadBase = baseOffset == GLYPH_HEADER_OFF
            ? GLYPH_PAYLOAD_OFF
            : GLYPH_SCRATCH_PAYLOAD_OFF;
          const dstPtr = payloadBase + (cell << 3) as usize;
          memory.copy(dstPtr, payloadPtr, 8);
        }
        return;
      }
      continue;
    }

    // Matching kind: Optical Wave Interference (Additive)
    let nextAmplitude = currentAmplitude + amplitude;
    if (nextAmplitude > 8388607) nextAmplitude = 8388607;
    if (nextAmplitude < -8388608) nextAmplitude = -8388608;

    // If waves perfectly annihilate, clear the glyph entirely
    const nextKind = nextAmplitude == 0 ? 0 : kind;

    const observed = atomic.cmpxchg<i32>(
      ptr,
      current,
      packGlyphHeader(nextKind, nextAmplitude),
    );
    if (observed == current) {
      if (kind == 2 && payloadPtr != 0) {
        // Technically if nextAmplitude is 0, payload is orphaned, but acceptable
        const payloadBase = baseOffset == GLYPH_HEADER_OFF
          ? GLYPH_PAYLOAD_OFF
          : GLYPH_SCRATCH_PAYLOAD_OFF;
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
  if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return;

  const cell = gy * GRID_W + gx;

  // Telemetry: increment role-based atomic counter
  if (kind >= 1 && kind <= 2 && role <= 4) {
    const statPtr = SECRETION_STATS_OFF +
      (((kind - 1) * 5 + (role as i32)) << 2) as usize;
    atomic.add<i32>(statPtr, 1);
  }

  // Energy Cost
  if (atomIdx >= 0) {
    let cost: i32 = 0;
    if (kind == 1) cost = PHEROMONE_COST_BASE + (intensity >> 3);
    else if (kind == 2) cost = PLASMID_COST_BASE + (intensity >> 2);

    if (cost > 0) {
      const currentEnergy = getEnergy(atomIdx);
      setEnergy(atomIdx, currentEnergy - cost);
    }
  }

  // Role-based Phase Imprinting (Parasite = Destructive, Sys/Prod = Constructive)
  const isDestructive = role == 4;
  const phaseIntensity = isDestructive ? -intensity : intensity;

  atomicDepositGlyphHeader(
    GLYPH_HEADER_OFF,
    cell,
    kind,
    phaseIntensity,
    payloadPtr,
  );

  // Halo spill for Pheromones (kind=1)
  if (kind == 1) {
    const spill = phaseIntensity >> 2;
    if (Math.abs(spill) > 0) {
      if (gx > 0) {
        atomicDepositGlyphHeader(GLYPH_HEADER_OFF, cell - 1, 1, spill);
      }
      if (gx < 139) {
        atomicDepositGlyphHeader(GLYPH_HEADER_OFF, cell + 1, 1, spill);
      }
      if (gy > 0) {
        atomicDepositGlyphHeader(GLYPH_HEADER_OFF, cell - GRID_W, 1, spill);
      }
      if (gy < 79) {
        atomicDepositGlyphHeader(GLYPH_HEADER_OFF, cell + GRID_W, 1, spill);
      }
    }
  }
}

export function tickGlyphTransport(tick: i32): void {
  // Sampling grid for internal reflection (Stage 5.1/5.2)
  memory.fill(GLYPH_SCRATCH_HEADER_OFF, 0, (GRID_CELLS) << 2);

  const dx = [-1, 1, 0, 0];
  const dy = [0, 0, -1, 1];

  for (let cell = 0; cell < (GRID_CELLS as i32); cell++) {
    const header = load<i32>(GLYPH_HEADER_OFF + (cell << 2) as usize);
    if (header == 0) continue;

    const kind = unpackGlyphKind(header);
    const amp = unpackGlyphAmplitude(header);
    if (amp == 0) continue;

    const decay = decayForKind(kind, amp);

    // Bidirectional Decay (pull towards zero)
    let retained = 0;
    if (amp > 0) {
      retained = amp - decay;
      if (retained < 0) retained = 0;
    } else {
      retained = amp - decay; // decay is negative when amp is negative
      if (retained > 0) retained = 0;
    }

    if (Math.abs(retained) > 0) {
      atomicDepositGlyphHeader(GLYPH_SCRATCH_HEADER_OFF, cell, kind, retained);
      if (kind == 2) { // PLASMID payload persistence
        const srcPtr = GLYPH_PAYLOAD_OFF + (cell << 3) as usize;
        const dstPtr = GLYPH_SCRATCH_PAYLOAD_OFF + (cell << 3) as usize;
        memory.copy(dstPtr, srcPtr, 8);
      }
    }

    const share = diffusionShareForKind(kind, amp);
    if (Math.abs(share) > 0) {
      const gx = cell % GRID_W;
      const gy = cell / GRID_W;

      for (let i = 0; i < 4; i++) {
        let nx = gx + dx[i];
        let ny = gy + dy[i];
        if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
          const nextCell = ny * GRID_W + nx;
          atomicDepositGlyphHeader(
            GLYPH_SCRATCH_HEADER_OFF,
            nextCell,
            kind,
            share,
          );

          if (share >= 128 || share <= -128) {
            const srcPtr = GLYPH_PAYLOAD_OFF + (cell << 3) as usize;
            const dstPtr = GLYPH_SCRATCH_PAYLOAD_OFF + (nextCell << 3) as usize;
            memory.copy(dstPtr, srcPtr, 8);
          }
        }
      }
    }
  }

  // 2. Seeding: Internal Reflection (Signal -> Pheromone)
  for (let cell: i32 = 0; cell < (GRID_CELLS as i32); cell++) {
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
  for (let cell: i32 = 0; cell < (GRID_CELLS as i32); cell++) {
    const memOffset = MEMORY_GRID_OFF + (cell << 3) as usize;
    const memoryLo = atomic.load<u32>(memOffset);
    const charge = memoryLo & 0xFFFFFF; // 24-bit charge

    if (charge >= 1) {
      let amp = charge >> 2;
      if (amp < 24) amp = 24;
      if (amp > 384) amp = 384;
      atomicDepositGlyphHeader(
        GLYPH_SCRATCH_HEADER_OFF,
        cell,
        2,
        amp,
        memOffset,
      );
      // Quantification
      if ((cell % 32) == 0) {
        atomic.add<i32>(SECRETION_STATS_OFF + 44, 1); // Memory leak counter
      }
    }
  }

  memory.copy(GLYPH_PAYLOAD_OFF, GLYPH_SCRATCH_PAYLOAD_OFF, GRID_CELLS << 3);
  memory.copy(GLYPH_HEADER_OFF, GLYPH_SCRATCH_HEADER_OFF, GRID_CELLS << 2);
}

// --- PER-ROLE SECRETION PREDICATES ---

function guardianShouldEmitPheromone(
  tick: i32,
  idx: i32,
  phase: i32,
  resonance: i32,
): bool {
  if (load<u8>(CAUSALITY_OFF + idx) == 0) return false;
  if (((tick + idx) % 64) != 0) return false;
  return resonance > 300;
}

function architectShouldEmitPlasmid(
  tick: i32,
  idx: i32,
  phase: i32,
  resonance: i32,
  energy: i32,
): bool {
  if (((tick + idx) % 32) != 0) return false;
  return resonance > 200;
}

function producerShouldEmitPheromone(
  tick: i32,
  idx: i32,
  phase: i32,
  resonance: i32,
  energy: i32,
): bool {
  if (((tick + idx) % 128) != 0) return false;
  return resonance > 400;
}

function producerShouldEmitPlasmid(
  tick: i32,
  idx: i32,
  phase: i32,
  resonance: i32,
  energy: i32,
): bool {
  if (((tick + idx) % 128) != 0) return false;
  return energy > 800;
}

function neutralShouldEmitPheromone(
  tick: i32,
  idx: i32,
  phase: i32,
  resonance: i32,
): bool {
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

    // --- Stage 9.1: Resonance-Weighted Stiffness & Symbiosis ---
    let myRes = getReadResonance(idx);
    let targetRes = getReadResonance(targetIdx);

    // 1. Resonance Synchronization: Equalize resonance between bonded partners (5% flow)
    if (targetRes > myRes) {
      addResonanceDelta(idx, (targetRes - myRes) / 20);
    } else if (myRes > targetRes) {
      addResonanceDelta(idx, -((myRes - targetRes) / 20));
    }

    // 2. Resonance-Weighted Stiffness: Bonds are stronger if atoms are synchronized
    let sumRes: f32 = (myRes as f32) + (targetRes as f32);
    let resonanceWeight: f32 = sumRes / 600.0;
    if (resonanceWeight < 0.5) resonanceWeight = 0.5;
    if (resonanceWeight > 2.0) resonanceWeight = 2.0;

    if (stiffness > 0.8) {
      let force = (dist - (targetDist as f32)) * 1.5 * resonanceWeight;
      fx += (dx / dist) * force;
      fy += (dy / dist) * force;
    } else {
      let elasticRange: f32 = 10.0;
      if (dist > (targetDist as f32) + elasticRange) {
        let force = (dist - ((targetDist as f32) + elasticRange)) * 0.1 *
          resonanceWeight;
        fx += (dx / dist) * force;
        fy += (dy / dist) * force;
      } else if (dist < (targetDist as f32) - elasticRange) {
        let force = (((targetDist as f32) - elasticRange) - dist) * 0.2 *
          resonanceWeight;
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

  // ACCUMULATE instead of immediate store
  accForceX += fx;
  accForceY += fy;
}

export function execute_atom(atomIndex: i32): void {
  let id = load<u64>(IDS_OFFSET + (atomIndex << 3) as usize);
  let curX = getReadX(atomIndex) as i32;
  let curY = getReadY(atomIndex) as i32;
  let role = getRole(atomIndex);

  if (atomIndex == 11 || atomIndex == 8) {
    trace_atom(atomIndex, 1000, curX, curY, id as i32);
  }

  // --- VECTOR 7: THE QUANTUM SHIFT ---
  // If id > 10, calculate physics (matching JS neural verification)
  if (id > 10) {
    // Reset accumulation
    accForceX = 0;
    accForceY = 0;

    let vx = getGenomeVelocityX(atomIndex);
    let vy = getGenomeVelocityY(atomIndex);
    let energy = getEnergy(atomIndex);
    let phase = getPhase(atomIndex);
    let res = getResonance(atomIndex);
    const tick = load<i32>(TICK_COUNTER_OFF);
    const cell = (curY / 10) * GRID_W + (curX / 10);

    // DECENTRALIZED SECRETION
    if (
      role == ROLE_GUARDIAN &&
      guardianShouldEmitPheromone(tick, atomIndex, phase, res)
    ) {
      secreteGlyph(
        curX,
        curY,
        1,
        clampResource(res / 4) as i32,
        role,
        atomIndex,
      );
    } else if (
      role == ROLE_ARCHITECT &&
      architectShouldEmitPlasmid(tick, atomIndex, phase, res, energy)
    ) {
      secreteGlyph(
        curX,
        curY,
        2,
        clampResource((energy + res) / 10) as i32,
        role,
        atomIndex,
        LOGIC_OFFSET + (atomIndex << 3),
      );
    } else if (role == ROLE_PRODUCER) {
      if (producerShouldEmitPheromone(tick, atomIndex, phase, res, energy)) {
        secreteGlyph(
          curX,
          curY,
          1,
          clampResource((res + energy) / 10) as i32,
          role,
          atomIndex,
        );
      }
      if (producerShouldEmitPlasmid(tick, atomIndex, phase, res, energy)) {
        secreteGlyph(
          curX,
          curY,
          2,
          clampResource((energy + res) / 12) as i32,
          role,
          atomIndex,
          LOGIC_OFFSET + (atomIndex << 3),
        );
      }
    } else if (
      role == ROLE_NEUTRAL &&
      neutralShouldEmitPheromone(tick, atomIndex, phase, res)
    ) {
      secreteGlyph(
        curX,
        curY,
        1,
        clampResource(res / 8) as i32,
        role,
        atomIndex,
      );
    } else if (role == ROLE_PARASITE && (tick % 64) == 0) {
      secreteGlyph(
        curX,
        curY,
        2,
        32,
        role,
        atomIndex,
        LOGIC_OFFSET + (atomIndex << 3),
      );
    }

    applyBondSprings(atomIndex, curX, curY);
    calculateTrophism(atomIndex, curX, curY, role);

    // Final position integration (velocity + forces)
    let damping = load<u8>(DAMPING_OFF + atomIndex as usize);
    // HORMONE 1: time_viscosity lowers effective dampingFactor (range 0..2048 → 0..0.15 additive)
    let viscosityH: f32 = getHormone(1) as f32 / 2048.0;
    let dampingFactor = Mathf.max(
      0,
      1.0 - (damping as f32) / 255.0 - viscosityH * 0.15,
    );

    // Behavior velocity is added on top of force integration
    let nextX = (curX as f32) + accForceX +
      (vx as f32) * 2.0 * (dampingFactor as f32);
    let nextY = (curY as f32) + accForceY +
      (vy as f32) * 2.0 * (dampingFactor as f32);

    // Hard float clamping before rounding limits any NaN/Infinity physics bugs
    if (nextX < 0.0) nextX = 0.0;
    if (nextX > 1399.0) nextX = 1399.0;
    if (nextY < 0.0) nextY = 0.0;
    if (nextY > 799.0) nextY = 799.0;

    if (atomIndex == 11) {
      trace_atom(
        11,
        999,
        Math.round(accForceX) as i32,
        Math.round(vx) as i32,
        Math.round(nextX) as i32,
      );
    }
    storeClampedPos(
      atomIndex,
      Math.round(nextX) as i32,
      Math.round(nextY) as i32,
    );
  }

  let pc = getPC(atomIndex);
  let energy = getReadEnergy(atomIndex);
  let resonance = getReadResonance(atomIndex);
  const instr_base: usize = INSTRUCTIONS_OFFSET + (atomIndex << 6) as usize;

  // Bounded Reduction - Gas Accounting Economy
  let mass: i32 = 1;
  const bondBase = BONDS_OFFSET + (atomIndex << 4) as usize;
  for (let b = 0; b < 4; b++) {
    const target = load<i32>(bondBase + (b << 2) as usize);
    if (target > 0 && target < MAX_ATOMS) mass++;
  }

  let gasUsed: i32 = 0;
  // Hard cap to prevent WASM thread lockup, bounded by physical energy
  let baseLimit: i32 = energy < 100 ? energy : 100;
  let gasLimit: i32 = baseLimit / mass;
  if (gasLimit < 1) gasLimit = 1;

  while (gasUsed < gasLimit) {
    const op = load<u8>(instr_base + (pc as usize));
    if (op == OP_NOP) {
      gasUsed += 1;
      break;
    }

    switch (op) {
      case OP_SET: {
        let reg = load<u8>(instr_base + (pc + 1) as usize);
        let imm = load<i8>(instr_base + (pc + 2) as usize);
        setReg(atomIndex, reg as i32, imm as i32);
        pc += 3;
        gasUsed += 1;
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
          if (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H) {
            val = readStructureCharge(gy * GRID_W + gx);
          }
        } else if (prop == PROP_QUORUM) {
          let rx = getX(atomIndex) as i32;
          let ry = getY(atomIndex) as i32;
          let gx = rx / 10;
          let gy = ry / 10;
          if (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H) {
            val = getSpatialGridCount(gx, gy);
          }
        } else if (prop == PROP_NEURAL_COHERENCE) {
          val = atomic.load<i32>(NEURAL_COHERENCE_OFF);
        } else if (prop == PROP_MEMORY) {
          let rx = getX(atomIndex) as i32;
          let ry = getY(atomIndex) as i32;
          let gx = rx / 10;
          let gy = ry / 10;
          if (gx >= 0 && gx < GRID_W && gy >= 0 && gy < GRID_H) {
            val = load<u8>(MEMORY_GRID_OFF + ((gy * GRID_W + gx) << 3)) as i32;
          }
        } else if (prop == PROP_CONSENSUS) {
          val = getHormone(6) as i32;
        }
        setReg(atomIndex, reg as i32, val);
        pc += 3;
        gasUsed += 2;
        break;
      }
      case OP_PUT: {
        let reg = load<u8>(instr_base + (pc + 1) as usize);
        let prop = load<u8>(instr_base + (pc + 2) as usize);
        let val = getReg(atomIndex, reg as i32);
        if (prop == PROP_ENERGY) {
          energy = val;
          setEnergy(atomIndex, val);
        } else if (prop == PROP_RESONANCE) {
          if (val > resonance) {
            let diff = val - resonance;
            let cost = diff * 1000; // Energy is stored in thousandths
            if (energy >= cost) {
              energy -= cost;
              resonance = val;
            } else {
              resonance += energy / 1000;
              energy = 0;
            }
          } else {
            // Free stealth drop
            resonance = val;
          }
          setResonance(atomIndex, resonance);
          setEnergy(atomIndex, energy);
        } else if (prop == PROP_PHASE) setPhase(atomIndex, val);
        pc += 3;
        gasUsed += 2;
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
        gasUsed += 1;
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
        gasUsed += 1;
        break;
      }
      case OP_JNZ: {
        let reg = load<u8>(instr_base + (pc + 1) as usize);
        let target = load<u8>(instr_base + (pc + 2) as usize);
        if (getReg(atomIndex, reg as i32) != 0) pc = target;
        else pc += 3;
        gasUsed += 2;
        break;
      }
      case OP_JMP: {
        pc = load<u8>(instr_base + (pc + 1) as usize);
        gasUsed += 2;
        break;
      }
      case OP_SYSCALL: {
        setPendingSyscall(atomIndex, 1);
        pc += 1;
        gasUsed += 10;
        gasLimit = 0; // force yield to host
        break;
      }
      case OP_RESOLVE: {
        let destReg = load<u8>(instr_base + ((pc + 1) as usize));
        let angleReg = load<u8>(instr_base + ((pc + 2) as usize));
        let modeReg = load<u8>(instr_base + ((pc + 3) as usize));

        let angle = getReg(atomIndex, angleReg as i32);
        let modeVal = getReg(atomIndex, modeReg as i32);

        // modeVal decoding:
        // 0: Sin Direct  (1 Gas)
        // 1: Sin LERP    (5 Gas)
        // 2: Cos Direct  (1 Gas)
        // 3: Cos LERP    (5 Gas)
        // 4: Sin Taylor2 (10 Gas - Reserved)

        let val = 0;
        let cost = 1;
        let highRes = 0;

        if (modeVal == 1 || modeVal == 3) {
          highRes = 1;
          cost = 5;
        } else if (modeVal == 4 || modeVal == 5) {
          highRes = 2; // Reserved for Taylor2
          cost = 10;
        }

        if (modeVal == 0 || modeVal == 1 || modeVal == 4) {
          val = math_sin(angle, highRes);
        } else {
          val = math_cos(angle, highRes);
        }

        setReg(atomIndex, destReg as i32, val);
        pc += 4;
        gasUsed += cost;
        break;
      }
      case OP_RESONATE_KURAMOTO: {
        let gx = (getX(atomIndex) / 1000) as i32;
        let gy = (getY(atomIndex) / 1000) as i32;
        let sumSin = 0;
        let currentPhase = getPhase(atomIndex);
        let neighborCount = 0;

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            let nx = gx + dx;
            let ny = gy + dy;
            if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
              let count = getSpatialGridCount(nx, ny);
              for (let i = 0; i < count; i++) {
                let neighborId = getSpatialGridAtom(nx, ny, i);
                if (
                  neighborId > 0 && neighborId != atomIndex &&
                  neighborId < MAX_ATOMS
                ) {
                  let neighborPhase = getPhase(neighborId);
                  let diff = (neighborPhase - currentPhase) & 255;
                  sumSin += math_sin(diff, 0); // Direct lookup for density scaling
                  neighborCount++;
                }
              }
            }
          }
        }

        let coh = atomic.load<i32>(NEURAL_COHERENCE_OFF);
        let K = 5 + (coh / 100);
        if (K > 128) K = 128;

        if (neighborCount > 0) {
          let d_theta = (K * sumSin) >> 15;
          let theta_next = (currentPhase + d_theta) & 255;
          setPhase(atomIndex, theta_next);
        }

        pc += 1;
        gasUsed += 5 + neighborCount * 2;
        break;
      }
      case OP_SPORE_DRIVE: {
        setPendingSyscall(atomIndex, 20); // 20 = SYS_SPORE_DRIVE in JS Host
        pc += 1;
        gasUsed += 10;
        gasLimit = 0; // force yield to host
        break;
      }
      case OP_SENSE: {
        setPendingSyscall(atomIndex, 21); // 21 = SYS_SENSE_PHASE
        pc += 1;
        gasUsed += 2;
        gasLimit = 0; // force yield to host
        break;
      }
      default: {
        pc = 0; // Reset or stop
        gasUsed += 1;
        gasLimit = 0; // stop execution on invalid opcode
        break;
      }
    }
    if (pc >= 64) pc = 0;
  }
  setPC(atomIndex, pc);

  // HORMONE 0: entropy_pressure scales metabolic cost (range 0..2048 → +0..+4 per executed step)
  let entropyH: i32 = getHormone(0) as i32;
  // HORMONE 5: mutation_friction adds a metabolic floor (range 0..2048 → +0..+8 per execute)
  let frictionH: i32 = getHormone(5) as i32;

  // --- [x] **Stage 11.1: Neural Synthesis (The Global Coherence)**
  // - [x] Implement global signal aggregation in WASM kernel.
  // - [x] Link `NEURAL_COHERENCE` to metabolic tax reduction.
  // - [x] Synchronize atomic `PHASE` with global pulse harmonics.
  // - [/] Verify systemic feedback via `test_neural_synthesis.ts`.
  let coherenceVal = atomic.load<i32>(NEURAL_COHERENCE_OFF as usize);
  // Coherence discount: if global coherence is high (>100 signals), reduce cost
  let discount: i32 = coherenceVal > 1000 ? 2 : (coherenceVal > 100 ? 1 : 0);

  let baseComputeCost = gasUsed >> discount;
  let metabolicCost = 1 + baseComputeCost +
    ((gasUsed * entropyH) >> (12 + discount)) + (frictionH >> 8);

  // --- STAGE 11.1: PHASE SYNCHRONIZATION ---
  if (coherenceVal > 500) {
    // Neural Field Resonance: pull atomic phase towards harmonic threshold (128)
    let curPhase: i32 = getPhase(atomIndex) as i32;
    if (curPhase < 128) curPhase += 2;
    else if (curPhase > 128) curPhase -= 1;
    setPhase(atomIndex, curPhase as u8);
  }

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
  // Re-fetch energy and resonance because asynchronous Syscalls (e.g. SYS_TRANSFER) might have mutated the host buffer
  let finalEnergy: i32 = getEnergy(atomIndex) as i32;
  let finalResonance: i32 = getResonance(atomIndex) as i32;

  if (finalResonance > 0) {
    setResonance(atomIndex, finalResonance - resonanceDecay);
  }
  setEnergy(
    atomIndex,
    finalEnergy > metabolicCost ? finalEnergy - metabolicCost : 0,
  );
}

const STR_VOID: i32 = 0;
const STR_WIRE: i32 = 1;
const STR_NODE: i32 = 2;
const STR_DIODE: i32 = 3;
const STR_SOURCE: i32 = 4;
const STR_SINK: i32 = 5;
const STR_CAPACITOR: i32 = 6;
const STR_INVERTER: i32 = 7;
const STR_LATCH: i32 = 8;
let spatialHashOverflowCount: i32 = 0;
let spatialHashMaxCellCount: i32 = 0;

export function get_spatial_hash_overflow_count(): i32 {
  return spatialHashOverflowCount;
}

export function get_spatial_hash_max_cell_count(): i32 {
  return spatialHashMaxCellCount;
}

export function build_spatial_hash(): void {
  const CELL_CAPACITY: i32 = 31;
  const MAX_ATOM_SLOTS: i32 = CELL_CAPACITY - 1;

  spatialHashOverflowCount = 0;
  spatialHashMaxCellCount = 0;

  // 1. Clear Grid and Quorum
  for (let i = 0; i < (GRID_CELLS as i32); i++) {
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

    let x = (getX(idx) as i32) / 100;
    let y = (getY(idx) as i32) / 100;

    // Clamp
    if (x < 0) x = 0;
    if (x > 1399) x = 1399;
    if (y < 0) y = 0;
    if (y > 799) y = 799;

    let cellX = x / 10;
    let cellY = y / 10;
    let cellIdx = cellY * GRID_W + cellX;
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
  for (let i = 0; i < (GRID_CELLS as i32); i++) {
    let offset = SPATIAL_GRID_OFFSET + (i << 7);
    let count = atomic.load<i32>(offset as usize);
    if (count > 0) {
      let sum = atomic.load<i32>((offset + (CELL_CAPACITY << 2)) as usize);
      // We reuse slot 31 (CELL_CAPACITY) for the average after clearing the sum
      atomic.store<i32>((offset + (CELL_CAPACITY << 2)) as usize, sum / count);
    }
  }
}

// --- OMEGA-64 | Environmental Physics: Viral Diffusion ---

function prng_next(state: u32): u32 {
  return (state * 1664525 + 1013904223) | 0;
}

export function diffuseViralSemantics(pulseId: i32): void {
  let state = pulseId as u32;

  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      const idx = (y * GRID_W + x) * 9;
      const targetOff = SIGNAL_GRID_OFF + (idx as usize);
      const intensity = atomic.load<u8>(targetOff + 8);
      if (intensity == 0) continue;

      // 1. DECAY
      const nextIntensity = intensity > 2 ? intensity - 2 : 0;
      atomic.store<u8>(targetOff + 8, nextIntensity);

      // 2. DIFFUSE (Deterministic chance to spread logic to neighbors)
      state = prng_next(state);
      const v1 = (state as f32) / (0xFFFFFFFF as f32);

      if (intensity > 150 && v1 < 0.1) {
        state = prng_next(state);
        const v2 = (state as f32) / (0xFFFFFFFF as f32);
        state = prng_next(state);
        const v3 = (state as f32) / (0xFFFFFFFF as f32);

        const nx = x + (v2 > 0.5 ? 1 : -1);
        const ny = y + (v3 > 0.5 ? 1 : -1);

        if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
          const nIdx = (ny * GRID_W + nx) * 9;
          const nTargetOff = SIGNAL_GRID_OFF + (nIdx as usize);
          const nIntensity = atomic.load<u8>(nTargetOff + 8);

          if (nIntensity < (intensity >> 1)) {
            // Copy logic and part of intensity
            for (let b: usize = 0; b < 8; b++) {
              const logicByte = atomic.load<u8>(targetOff + b);
              atomic.store<u8>(nTargetOff + b, logicByte);
            }
            atomic.store<u8>(nTargetOff + 8, (intensity >> 1) as u8);
          }
        }
      }
    }
  }
}

export function tick_structure_grid(): void {
  // Use a temporary stack buffer for charges if possible, or just write-behind
  // Since this is usually called from one worker, we can afford a bit of drift or use a small scratchpad
  // But for GRID_CELLS cells, we should probably just use a dedicated scratch area in shared memory if we want bit-perfection
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

      // --- AUTOPOIESIS: Spontaneous Crystallization ---
      if (type == STR_VOID) {
        let maxNCharge: i32 = currentCharge;
        for (let n = 0; n < 8; n++) {
          let nx = x + dir8X(n);
          let ny = y + dir8Y(n);
          if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
            let ni = ny * GRID_W + nx;
            const nVal = atomic.load<i32>(STRUCTURE_GRID_OFF + (ni << 2));
            const nCharge = (nVal >> 16) & 0xFF;
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
          // Trace only the first few to avoid flood
          if (i == 5670) {
            trace_atom(i, 0x378, maxNCharge, 1, 1);
          }
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

      // AUTOPOIESIS: Resonance Shielding
      // Read average phase from spatial grid average slot (slot 31)
      let spatialIdx = y * GRID_W + x;
      let avgPhase = atomic.load<i32>(
        SPATIAL_GRID_OFFSET + (spatialIdx << 7) + (31 << 2),
      );

      let decay = 10;
      if (avgPhase > 128) decay = 2; // Shielded

      let nextCharge = currentCharge > decay ? currentCharge - decay : 0;

      // --- ERA 34: Structural Memory Leakage ---
      // If density is low but not yet zero, leak memory logic into signal grid.
      if (nextCharge > 0 && nextCharge < 50) {
        const memoryPtr = MEMORY_GRID_OFF + (i << 3) as usize;
        const signalPtr = SIGNAL_GRID_OFF + (i << 3) as usize; // Each cell has 8+1 bytes in signal grid?
        // Wait, SIGNAL_GRID cell size depends on implementation.
        // In OMEGA, signalGrid usually matches GRID size (140x80) but here
        // we follow the JS logic: gridIdx = i * 9.
        const gridIdx = i * 9;
        const targetSignalOff = SIGNAL_GRID_OFF + (gridIdx as usize);

        for (let b: usize = 0; b < 8; b++) {
          const logicByte = load<u8>(memoryPtr + b);
          if (logicByte != 0) {
            atomic.store<u8>(targetSignalOff + b, logicByte);
          }
        }
        // Set intensity (byte 8 of the 9-byte viral/signal cell)
        atomic.store<u8>(targetSignalOff + 8, (50 - nextCharge) as u8);
      }

      if (nextCharge == 0) {
        // Clear memory if structure is gone
        const memoryPtr = MEMORY_GRID_OFF + (i << 3) as usize;
        store<u64>(memoryPtr, 0);
      }

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
      } else if (type == STR_INVERTER) {
        let maxNeighborCharge: i32 = 0;
        for (let n = 0; n < 4; n++) {
          let nx = x + dir4X(n);
          let ny = y + dir4Y(n);
          if (nx >= 0 && nx < GRID_W && ny >= 0 && ny < GRID_H) {
            let ni = ny * GRID_W + nx;
            let nCharge = readStructureCharge(ni);
            if (nCharge > maxNeighborCharge) maxNeighborCharge = nCharge;
          }
        }
        if (maxNeighborCharge < 50) nextCharge = 255;
        else nextCharge = 0;
      } else if (type == STR_LATCH) {
        let newState = state;
        // n=0 (Left): SET
        let setX = x + dir4X(0);
        let setY = y + dir4Y(0);
        if (setX >= 0 && setX < GRID_W && setY >= 0 && setY < GRID_H) {
          if (readStructureCharge(setY * GRID_W + setX) > 100) newState = 1;
        }
        // n=1 (Right): RESET
        let rstX = x + dir4X(1);
        let rstY = y + dir4Y(1);
        if (rstX >= 0 && rstX < GRID_W && rstY >= 0 && rstY < GRID_H) {
          if (readStructureCharge(rstY * GRID_W + rstX) > 100) newState = 0;
        }
        if (newState != state) {
          cellVal = (cellVal & 0x00FFFFFF) | (newState << 24);
        }
        if (newState == 1) nextCharge = 255;
        else nextCharge = 0;
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

/**
 * ERA 71: THE PHEROMONE CANOPY
 * Unifies all environmental physics into a single serial tick.
 * Called by Worker 0 during the Matrix phase.
 */
export function tick_environment(tick: i32): void {
  // 1. Attention Field Decay (90% per tick)
  for (let i = 0; i < (GRID_CELLS as i32); i++) {
    const ptr = ATTENTION_FIELD_OFF + (i << 2);
    const val = load<f32>(ptr as usize);
    if (val > 0.0) {
      store<f32>(ptr as usize, val * 0.9);
    }
  }

  // 2. Structural Decay & Autopoiesis
  tick_structure_grid();

  // 3. Viral Semantic Diffusion
  diffuseViralSemantics(tick);

  // 4. Pheromone / Plasmid Diffusion
  tickGlyphTransport(tick);
}

// Deprecated in favor of tick_environment
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
  let totalAmplitude: i32 = 0;
  let oscillatorCount: i32 = 0;

  for (let i = 0; i < (GRID_CELLS as i32); i++) {
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
  let oscCoherence: i32 = 0;
  if (oscillatorCount > 0) {
    oscCoherence = totalAmplitude / oscillatorCount;
    if (oscCoherence > 2000) oscCoherence = 2000;
  }

  // Vector 10: Unify with OP_SIGNAL accumulator
  let signalSignals = atomic.load<i32>(COHERENCE_OFF as usize);
  trace_atom(8888, 111, signalSignals, 0, 0);

  return oscCoherence + signalSignals;
}

// SOVEREIGN_ORACLE writes computed coherence back to shared broadcast channel
export function set_neural_coherence(value: i32): void {
  atomic.store<i32>(NEURAL_COHERENCE_OFF as usize, value);
}

export function clear_secretion_stats(): void {
  memory.fill(SECRETION_STATS_OFF, 0, 48); // Ensure we clear all 12 I32 slots
}

export function reset_neural_coherence(): void {
  atomic.store<i32>(COHERENCE_OFF as usize, 0); // Reset accumulator
}

export function clear_metabolism_stats(): void {
  // Clear genome count scratch (65536 * 4 bytes = 256KB)
  // and generic stats (population, noveltyDelta, symbiosisDelta, etc)
  memory.fill(METABOLISM_SCRATCH_OFF, 0, (65536 * 4) + 64);
}

export function accumulate_metabolism_stats(startIdx: i32, endIdx: i32): void {
  for (let i = startIdx; i < endIdx; i++) {
    const pId = IDS_OFFSET + (i << 3) as usize;
    if (load<i64>(pId) == 0) continue;

    const key = genomeKey16(i);
    // Atomic add to genome frequency map in scratch space
    atomic.add<i32>(METABOLISM_SCRATCH_OFF + (key << 2), 1);
    // Atomic add to global population counter (scratch end)
    atomic.add<i32>(METABOLISM_SCRATCH_OFF + (65536 * 4), 1);
  }
}

export function apply_metabolism_kernel(
  startIdx: i32,
  endIdx: i32,
  noveltySigned: i32,
  symbiosisSigned: i32,
  baseTax: i32,
  targetEnergy: i32,
  homeostasisBand: i32,
  homeostasisMaxDelta: i32,
  overflowThreshold: i32, // multiplied by 1024
  spatialOverflowRatio: i32, // multiplied by 1024
  starvationFloor: i32,
  subsidyEnabled: i32,
): void {
  const population = atomic.load<i32>(METABOLISM_SCRATCH_OFF + (65536 * 4));
  if (population == 0) return;

  const overflowActive = spatialOverflowRatio >= overflowThreshold;
  const bandStep = i32(Math.max(1, Math.floor(homeostasisBand / 2)));
  const bondPolarity = symbiosisSigned >= 0 ? 1 : -1;

  for (let i = startIdx; i < endIdx; i++) {
    const pId = IDS_OFFSET + (i << 3) as usize;
    if (load<i64>(pId) == 0) continue;

    const current = getEnergy(i);

    // --- PHASE 43: FOSSILIZATION & NECROPOLIS ---
    // If atom is dead (energy <= 0), fossilize it before skipping metabolism
    if (current <= 0) {
      let resonance = atomic.load<i32>(RESONANCE_OFFSET + (i << 2) as usize);
      let roleRaw = atomic.load<u8>(ROLES_OFFSET + i as usize);
      let role = roleRaw & 0x7F; // Strip metazoan flag
      
      let ctx13 = atomic.load<i32>(CONTEXT_OFFSET + ((i * 16 + 13) << 2) as usize);
      let ctx14 = atomic.load<i32>(CONTEXT_OFFSET + ((i * 16 + 14) << 2) as usize);
      let hasImmunity = ctx13 != 0 || ctx14 != 0;

      let cx = atomic.load<i16>(XS_OFFSET + (i << 1) as usize) as i32;
      let cy = atomic.load<i16>(YS_OFFSET + (i << 1) as usize) as i32;
      let gx = cx / 10;
      let gy = cy / 10;
      let cellIdx = gy * GRID_W + gx;

      trace_atom(i, 0xDD, gx, gy, 0);

      // Only attempt fossilization if it has a qualifying property
      if (resonance > 100 || role == ROLE_GUARDIAN || role == ROLE_ARCHITECT || hasImmunity) {

        let structVal: i32 = 0;
        if (role == ROLE_GUARDIAN) {
            structVal = 1 | (150 << 16); // STR_WIRE = 1
        } else if (role == ROLE_ARCHITECT) {
            structVal = 1 | (100 << 16);
        }

        if (structVal != 0) {
            atomic.store<i32>(STRUCTURE_GRID_OFF + (cellIdx << 2) as usize, structVal);
        }

        // Epigenetic memory spillage
        let memOff = MEMORY_GRID_OFF + (cellIdx << 3) as usize;
        
        // Spilled CRISPR Hash (Reg 13) into bytes 4,5,6,7 in Big-Endian for test
        atomic.store<u8>(memOff + 4, (ctx13 >>> 24) as u8);
        atomic.store<u8>(memOff + 5, (ctx13 >>> 16) as u8);
        atomic.store<u8>(memOff + 6, (ctx13 >>> 8) as u8);
        atomic.store<u8>(memOff + 7, (ctx13) as u8);
        
        // Bootstrapping memory charge for Plasmid decay (bytes 0,1,2 in Little-Endian for test)
        let bootCharge = 100;
        atomic.store<u8>(memOff + 0, (bootCharge & 0xFF) as u8);
        atomic.store<u8>(memOff + 1, ((bootCharge >>> 8) & 0xFF) as u8);
        atomic.store<u8>(memOff + 2, ((bootCharge >>> 16) & 0xFF) as u8);

        // Neutralize resonance and role so IMMUNE.ts phagocyte immediately purges this necrotic corpse
        atomic.store<i32>(RESONANCE_OFFSET + (i << 2) as usize, 0);
        atomic.store<u8>(ROLES_OFFSET + i as usize, 0);
        atomic.store<i32>(CONTEXT_OFFSET + ((i * 16 + 13) << 2) as usize, 0);
        atomic.store<i32>(CONTEXT_OFFSET + ((i * 16 + 14) << 2) as usize, 0);
      }
      continue;
    }

    // --- PHASE 44: ENDOSYMBIOSIS ---
    let roleRaw = atomic.load<u8>(ROLES_OFFSET + i as usize);
    let role = roleRaw & 0x7F; // Strip metazoan flag
    if (role == 5) { // ROLE_MITOCHONDRIA
      let hostId = atomic.load<i32>(CONTEXT_OFFSET + ((i * 16 + 12) << 2) as usize);
      if (hostId > 0 && hostId < MAX_ATOMS && atomic.load<i64>(IDS_OFFSET + (hostId << 3) as usize) != 0) {
        // Enforce Coordinate Lock
        let hx = atomic.load<i16>(XS_OFFSET + (hostId << 1) as usize);
        let hy = atomic.load<i16>(YS_OFFSET + (hostId << 1) as usize);
        atomic.store<i16>(XS_OFFSET + (i << 1) as usize, hx);
        atomic.store<i16>(YS_OFFSET + (i << 1) as usize, hy);

        // Pay up 90% of excess energy to Host
        if (current > starvationFloor) {
          let transfer = i32(Math.floor(f64(current - starvationFloor) * 0.9));
          if (transfer > 0) {
            atomic.add<i32>(ENERGY_OFFSET + (hostId << 2) as usize, transfer);
            setEnergy(i, current - transfer);
          }
        }
      } else {
        // Host died. Mitochondria perishes.
        setEnergy(i, 0);
        atomic.store<i64>(IDS_OFFSET + (i << 3) as usize, 0);
      }
      continue; // Skip entropy tax and standard homeostasis
    }

    const key = genomeKey16(i);
    const sameGenomeCount = atomic.load<i32>(
      METABOLISM_SCRATCH_OFF + (key << 2),
    );

    let delta: i32 = 0;

    // Pass 1: Evolution Pressure (Novelty + Symbiosis)
    if (noveltySigned != 0) {
      let noveltyTerm = (noveltySigned * (population - (sameGenomeCount * 2))) /
        population;
      delta += noveltyTerm;
    }

    if (symbiosisSigned != 0) {
      const base = i * 4;
      let crossGenomeBonds = 0;
      for (let slot = 0; slot < 4; slot++) {
        const target = atomic.load<i32>(
          BONDS_OFFSET + ((base + slot) << 2) as usize,
        );
        if (target <= 0 || target >= MAX_ATOMS) continue;
        if (atomic.load<i64>(IDS_OFFSET + (target << 3) as usize) == 0) {
          continue;
        }
        if (genomeKey16(target) != key) crossGenomeBonds++;
      }
      delta += crossGenomeBonds > 0
        ? symbiosisSigned * crossGenomeBonds
        : bondPolarity * -symbiosisSigned;
    }

    // 2. Homeostasis
    // Match sequential logic: Homeostasis sees energy AFTER evolution pressure
    const interimEnergy = i32(Math.max(0.0, f64(current) + f64(delta)));

    if (baseTax > 0 && interimEnergy > starvationFloor) {
      let tax = Math.min(baseTax as f64, interimEnergy as f64) as i32;
      delta -= tax;
    }

    const deviation = interimEnergy - targetEnergy;
    const absDeviation = Math.abs(deviation);

    if (absDeviation > homeostasisBand) {
      const gradient = absDeviation - homeostasisBand;
      const step = i32(Math.min(
        homeostasisMaxDelta,
        1 + Math.floor(gradient / bandStep),
      ));

      if (deviation > 0) {
        delta -= step;
        if (overflowActive) delta -= 1;
      } else if (subsidyEnabled) {
        let subsidy = step;
        if (overflowActive) {
          subsidy = i32(Math.max(1, Math.floor(f32(subsidy) * 0.6)));
        }
        delta += subsidy;
      }
    }

    // Starvation Floor Guard (using interim energy for sequential match)
    if (interimEnergy <= starvationFloor && delta < 0) {
      // If we are at or below floor after evolution pressure,
      // block any further downward delta from homeostasis/tax.
      // But we should subtract what was already added in Pass 1 if it was negative?
      // Legacy logic in test: if (current <= starvationFloor && delta < 0) delta = 0;
      // where current is energy after Pass 1.
      // This means Pass 2 delta becomes 0.

      // To match exactly:
      const pass2Delta = delta - (interimEnergy - current);
      if (pass2Delta < 0) {
        delta = interimEnergy - current;
      }
    }

    if (delta != 0) {
      let next = i32(Math.max(0.0, f64(current) + f64(delta)));
      if (next != current) {
        setEnergy(i, next);
        // Track stats for telemetry
        atomic.add<i32>(METABOLISM_SCRATCH_OFF + (65536 * 4) + 4, 1);
        atomic.add<i32>(METABOLISM_SCRATCH_OFF + (65536 * 4) + 8, delta);
      }
    }
  }
}

const membraneVisited = new StaticArray<u8>(MAX_ATOMS);

function dfsMembrane(
  current: i32,
  start: i32,
  depth: i32,
  pathNodes: StaticArray<i32>,
  pathLen: i32
): i32 {
  if (depth >= 8) return 0;
  
  for (let b_slot = 0; b_slot < 4; b_slot++) {
    const target = atomic.load<i32>(
      BONDS_OFFSET + (((current << 2) + b_slot) << 2) as usize
    );
    if (target > 0 && target < MAX_ATOMS && atomic.load<i64>(IDS_OFFSET + (target << 3) as usize) != 0) {
      if (target == start && depth >= 2) {
        return pathLen;
      }
      if (target < start) continue;
      
      let contains = false;
      for (let i = 0; i < pathLen; i++) {
        if (unchecked(pathNodes[i]) == target) {
          contains = true;
          break;
        }
      }
      if (!contains) {
        unchecked(pathNodes[pathLen] = target);
        const finalLen = dfsMembrane(target, start, depth + 1, pathNodes, pathLen + 1);
        if (finalLen > 0) {
          return finalLen;
        }
      }
    }
  }
  return 0;
}

export function tick_membrane_physics(): void {
  for (let i = 1; i < MAX_ATOMS; i++) {
    const id = atomic.load<i64>(IDS_OFFSET + (i << 3) as usize);
    if (id != 0) {
      const roleOff = ROLES_OFFSET + i;
      const role = atomic.load<u8>(roleOff as usize);
      atomic.store<u8>(roleOff as usize, role & ~0x80);
      atomic.store<i32>(EVOLUTION_OFFSET + (i << 2) as usize, 0);
      unchecked(membraneVisited[i] = 0);
    }
  }

  const pathNodes = new StaticArray<i32>(8);

  for (let i = 1; i < MAX_ATOMS; i++) {
    if (atomic.load<i64>(IDS_OFFSET + (i << 3) as usize) == 0 || membraneVisited[i] == 1) {
      continue;
    }

    unchecked(pathNodes[0] = i);
    const ringLen = dfsMembrane(i, i, 0, pathNodes, 1);
    
    if (ringLen > 0) {
      // Phase 41: Morphogenesis BFS Component Expansion
      const componentNodes = new StaticArray<i32>(64);
      let head = 0;
      let tail = 0;

      // Initialize component with the detected Membrane ring
      for (let k = 0; k < ringLen; k++) {
        const node = unchecked(pathNodes[k]);
        unchecked(membraneVisited[node] = 1);
        unchecked(componentNodes[tail++] = node);
      }

      // BFS to expand the Metazoan tissue mask to all connected edges
      while (head < tail && tail < 64) {
        const curr = unchecked(componentNodes[head++]);
        
        for (let s = 0; s < 4; s++) {
          const neighbor = atomic.load<i32>(BONDS_OFFSET + ((curr << 2) + s) * 4 as usize);
          if (neighbor != 0) {
            // Only absorb if it hasn't mapped to a membrane component yet
            if (membraneVisited[neighbor] == 0 && tail < 64) {
              unchecked(membraneVisited[neighbor] = 1);
              unchecked(componentNodes[tail++] = neighbor);
            }
          }
        }
      }

      // 1. Calculate the Resource Pool over the ENTIRE tissue
      let sumEnergy: i64 = 0;
      let sumResonance: i64 = 0;

      for (let k = 0; k < tail; k++) {
        const node = unchecked(componentNodes[k]);
        sumEnergy += getEnergy(node);
        sumResonance += atomic.load<i32>(RESONANCE_OFFSET + (node << 2) as usize);
      }

      const avgEnergy = i32(sumEnergy / tail);
      const avgResonance = i32(sumResonance / tail);
      const totalResonance = i32(sumResonance);

      // 2. Distribute pool & Differentiate Organelles (Morphogenesis)
      for (let k = 0; k < tail; k++) {
        const node = unchecked(componentNodes[k]);
        setEnergy(node, avgEnergy);
        atomic.store<i32>(RESONANCE_OFFSET + (node << 2) as usize, avgResonance);
        atomic.store<i32>(EVOLUTION_OFFSET + (node << 2) as usize, totalResonance);
        
        // Count internal bonds to figure out topological layer (Surface vs Core)
        let internalBonds = 0;
        for (let s = 0; s < 4; s++) {
          const neighbor = atomic.load<i32>(BONDS_OFFSET + ((node << 2) + s) * 4 as usize);
          if (neighbor != 0) {
            // Verify if neighbor is part of this exact tissue component
            let isInternal = false;
            for (let c = 0; c < tail; c++) {
              if (unchecked(componentNodes[c]) == neighbor) {
                isInternal = true;
                break;
              }
            }
            if (isInternal) {
              internalBonds++;
            }
          }
        }

        // Morphological Differentiation
        const roleOff = ROLES_OFFSET + node;
        let role = atomic.load<u8>(roleOff as usize);
        
        // Clear underlying lower 7 bits for differentiation
        role = role & 0x80;

        // Apply topological epigenetics
        if (internalBonds >= 3) {
          // Core / Architect (Protected Processor)
          role = role | 3; // ROLE_ARCHITECT is 3 in STATE_MATRIX.ts
        } else {
          // Surface / Guardian (Radar & Armor)
          role = role | 2; // ROLE_GUARDIAN is 2 in STATE_MATRIX.ts
        }
        
        // Ensure Metazoan flag exists
        role = role | 0x80;

        atomic.store<u8>(roleOff as usize, role);
      }
      
      for (let k = 0; k < 8; k++) unchecked(pathNodes[k] = 0);
    }
  }
}
