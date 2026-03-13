// deno-lint-ignore-file
// @ts-nocheck
import {
  MAX_ATOMS, TICK_COUNTER_OFF, IDS_OFFSET,
  XS_OFFSET, YS_OFFSET, ENERGY_OFFSET, RESONANCE_OFFSET, PHASE_OFFSET,
  LOGIC_OFFSET, BONDS_OFFSET, STIFFNESS_OFFSET, INSTRUCTIONS_OFFSET, CONTEXT_OFFSET,
  EVOLUTION_OFFSET, BOND_REQUESTS_OFFSET, SPATIAL_GRID_OFFSET,
  ROLES_OFFSET, STRUCTURE_GRID_OFF, SIGNAL_GRID_OFF, MEMORY_GRID_OFF,
  ASCENSION_STATS_OFF, DAMPING_OFF,
  BOND_DISTANCES_OFFSET,
  INTENT_OFFSET, CAUSALITY_OFF,
  HIVE_MEMORY_OFF, HIVE_BALANCE_OFF, QUORUM_OFFSET, SPAWN_REQUESTS_OFF,
  SPAWN_GRID_OFF, COHERENCE_OFF, NEURAL_COHERENCE_OFF, PHYSICS_READ_XS_OFF,
  PHYSICS_READ_YS_OFF, PHYSICS_READ_ENERGY_OFF, PHYSICS_READ_RESONANCE_OFF,
  ENERGY_DELTA_OFF, RESONANCE_DELTA_OFF, STRUCTURE_BUILD_OWNER_OFF,
  STRUCTURE_BUILD_VALUE_OFF, STRUCTURE_CHARGE_INTENT_OFF, ATTENTION_FIELD_OFF,
  HIVE_ENERGY_POOL_OFF, GLYPH_HEADER_OFF, GLYPH_PAYLOAD_OFF,
  GLYPH_SCRATCH_HEADER_OFF, GLYPH_SCRATCH_PAYLOAD_OFF, HORMONE_OFF,
  SECRETION_STATS_OFF, LINEAGE_OFFSET, MEIOSIS_RESERVED_OFFSET, METABOLISM_SCRATCH_OFFSET,
  SPAWN_MAX, SPAWN_SLOT, SPAWN_HEAD_OFF, SPAWN_DATA_OFF, GENOMES_OFFSET,
  GRID_W, GRID_H, GRID_CELLS, RESOURCE_MAX
} from "../../../_as/mod";

export { RESOURCE_MAX };

export function clampResource(value: i64): i32 {
  if (value < 0) return 0;
  if (value > RESOURCE_MAX as i64) return RESOURCE_MAX;
  return value as i32;
}
export function getEnergy(idx: i32): i32 {
  return load<i32>(ENERGY_OFFSET + (idx << 2) as usize);
}
export function setEnergy(idx: i32, val: i32): void {
  store<i32>(ENERGY_OFFSET + (idx << 2) as usize, val);
}

export function genomeKey16(idx: i32): i32 {
  const ptr = (LOGIC_OFFSET + (idx << 3)) as usize;
  const b0 = load<u8>(ptr) as i32;
  const b1 = load<u8>(ptr + 1) as i32;
  return (b0 << 8) | b1;
}

export function getResonance(idx: i32): i32 {
  return load<i32>(RESONANCE_OFFSET + (idx << 2) as usize);
}
export function setResonance(idx: i32, val: i32): void {
  store<i32>(RESONANCE_OFFSET + (idx << 2) as usize, clampResource(val as i64));
}
export function getPhase(idx: i32): i32 {
  return load<i32>(PHASE_OFFSET + (idx << 2) as usize);
}
export function setPhase(idx: i32, val: i32): void {
  store<i32>(PHASE_OFFSET + (idx << 2) as usize, val);
}
export function getLineage(idx: i32): u64 {
  return load<u64>(LINEAGE_OFFSET + (idx << 3) as usize);
}
export function addResonance(idx: i32, delta: i32): void {
  setResonance(idx, getResonance(idx) + delta);
}

export function getHormone(id: i32): u16 {
  return atomic.load<u16>(HORMONE_OFF + (id << 1) as usize);
}
export function getX(idx: i32): i16 {
  return load<i16>(XS_OFFSET + (idx << 1) as usize);
}
export function getY(idx: i32): i16 {
  return load<i16>(YS_OFFSET + (idx << 1) as usize);
}
export function getReadX(idx: i32): i16 {
  return load<i16>(PHYSICS_READ_XS_OFF + (idx << 1) as usize);
}
export function getReadY(idx: i32): i16 {
  return load<i16>(PHYSICS_READ_YS_OFF + (idx << 1) as usize);
}
export function getReadEnergy(idx: i32): i32 {
  return load<i32>(PHYSICS_READ_ENERGY_OFF + (idx << 2) as usize);
}
export function getReadResonance(idx: i32): i32 {
  return load<i32>(PHYSICS_READ_RESONANCE_OFF + (idx << 2) as usize);
}
export function addEnergyDelta(idx: i32, delta: i32): void {
  if (delta != 0) {
    atomic.add<i32>(ENERGY_DELTA_OFF + (idx << 2) as usize, delta);
  }
}
export function addResonanceDelta(idx: i32, delta: i32): void {
  if (delta != 0) {
    atomic.add<i32>(RESONANCE_DELTA_OFF + (idx << 2) as usize, delta);
  }
}
export function getLogicByte(idx: i32, slot: i32): u8 {
  return load<u8>(LOGIC_OFFSET + (idx << 3) + slot as usize);
}
export function getBondTarget(atomIdx: i32, slot: i32): i32 {
  return load<i32>(BONDS_OFFSET + (atomIdx << 4) + (slot << 2) as usize);
}
export function setBondTarget(atomIdx: i32, slot: i32, targetIdx: i32): void {
  store<i32>(BONDS_OFFSET + (atomIdx << 4) + (slot << 2) as usize, targetIdx);
}
export function getBondStiffness(atomIdx: i32, slot: i32): f32 {
  return load<f32>(STIFFNESS_OFFSET + (atomIdx << 4) + (slot << 2) as usize);
}
export function setBondStiffness(atomIdx: i32, slot: i32, val: f32): void {
  store<f32>(STIFFNESS_OFFSET + (atomIdx << 4) + (slot << 2) as usize, val);
}
export function getSpatialGridCount(gx: i32, gy: i32): i32 {
  let cellIdx = gy * GRID_W + gx;
  return load<i32>(SPATIAL_GRID_OFFSET + (cellIdx << 7) as usize);
}
export function getSpatialGridAtom(gx: i32, gy: i32, subIdx: i32): i32 {
  let cellIdx = gy * GRID_W + gx;
  return load<i32>(
    SPATIAL_GRID_OFFSET + (cellIdx << 7) + ((subIdx + 1) << 2) as usize,
  );
}
export function getReg(atomIdx: i32, reg: i32): i32 {
  return load<i32>(CONTEXT_OFFSET + (atomIdx << 6) + (reg << 2) as usize);
}
export function setReg(atomIdx: i32, reg: i32, val: i32): void {
  store<i32>(CONTEXT_OFFSET + (atomIdx << 6) + (reg << 2) as usize, val);
}
export function getPC(atomIdx: i32): u8 {
  return load<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 32 as usize);
}
export function setPC(atomIdx: i32, val: u8): void {
  store<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 32 as usize, val);
}
export function getPendingSyscall(atomIdx: i32): u8 {
  return load<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 33 as usize);
}
export function setPendingSyscall(atomIdx: i32, val: u8): void {
  store<u8>(CONTEXT_OFFSET + (atomIdx << 6) + 33 as usize, val);
}
export function setBondDist(atomIdx: i32, slot: i32, dist: u8): void {
  store<u8>(BOND_DISTANCES_OFFSET + (atomIdx << 2) + slot as usize, dist);
}
export function setDamping(atomIdx: i32, val: u8): void {
  store<u8>(DAMPING_OFF + atomIdx as usize, val);
}
export function getRole(atomIdx: i32): u8 {
  return load<u8>(ROLES_OFFSET + atomIdx as usize);
}
export function setRole(atomIdx: i32, val: u8): void {
  store<u8>(ROLES_OFFSET + atomIdx as usize, val);
}
export function setHiveMemory(addr: i32, val: u8): void {
  store<u8>(HIVE_MEMORY_OFF + (addr & 1023) as usize, val);
}
export function getHiveMemory(addr: i32): u8 {
  return load<u8>(HIVE_MEMORY_OFF + (addr & 1023) as usize);
}
export function getHiveBalance(): i32 {
  return atomic.load<i32>(HIVE_BALANCE_OFF);
}
export function addHiveBalance(val: i32): i32 {
  return atomic.add<i32>(HIVE_BALANCE_OFF, val);
}
