// deno-lint-ignore-file
// @ts-nocheck
// OMEGA-64 | assembly/index.ts | Zero-Allocation WASM VM Core

import {
  MAX_ATOMS, SAFETY_BUFFER, TICK_COUNTER_OFF, IDS_OFFSET,
  XS_OFFSET, YS_OFFSET, ENERGY_OFFSET, RESONANCE_OFFSET, PHASE_OFFSET,
  LOGIC_OFFSET, BONDS_OFFSET, STIFFNESS_OFFSET, INSTRUCTIONS_OFFSET, CONTEXT_OFFSET,
  EVOLUTION_OFFSET, INTENT_OFFSET, BOND_REQUESTS_OFFSET, SPATIAL_GRID_OFFSET,
  ROLES_OFFSET, STRUCTURE_GRID_OFF, SIGNAL_GRID_OFF, MEMORY_GRID_OFF,
  ASCENSION_STATS_OFF, BOND_DISTANCES_OFFSET, DAMPING_OFF, CAUSALITY_OFF,
  HIVE_MEMORY_OFF, HIVE_BALANCE_OFF, QUORUM_OFFSET, SPAWN_REQUESTS_OFF,
  SPAWN_GRID_OFF, COHERENCE_OFF, NEURAL_COHERENCE_OFF, PHYSICS_READ_XS_OFF,
  PHYSICS_READ_YS_OFF, PHYSICS_READ_ENERGY_OFF, PHYSICS_READ_RESONANCE_OFF,
  ENERGY_DELTA_OFF, RESONANCE_DELTA_OFF, STRUCTURE_BUILD_OWNER_OFF,
  STRUCTURE_BUILD_VALUE_OFF, STRUCTURE_CHARGE_INTENT_OFF, ATTENTION_FIELD_OFF,
  HIVE_ENERGY_POOL_OFF, GLYPH_HEADER_OFF, GLYPH_PAYLOAD_OFF,
  GLYPH_SCRATCH_HEADER_OFF, GLYPH_SCRATCH_PAYLOAD_OFF, HORMONE_OFF,
  SECRETION_STATS_OFF, LINEAGE_OFFSET, MEIOSIS_RESERVED_OFFSET, METABOLISM_SCRATCH_OFFSET,
  SPAWN_MAX, SPAWN_SLOT, SPAWN_HEAD_OFF, SPAWN_DATA_OFF, GENOMES_OFFSET,
  GRID_W, GRID_H, GRID_CELLS, SPATIAL_CELL_SIZE,
  STR_VOID, STR_WIRE, STR_NODE, STR_DIODE, STR_SOURCE, STR_SINK,
  STR_CAPACITOR, STR_INVERTER, STR_LATCH,
  MAX_GLYPH_AMP, MIN_GLYPH_AMP
} from "../../../_as/mod.ts";

import {
  read_structure_charge, apply_bond_springs, glyph_transport, secrete_glyph,
  publish_build_intent, resolve_bond_requests, calculate_trophism, get_glyph_influence,
  get_genome_velocity_x, get_genome_velocity_y, get_attention_cell, fire_signal,
  encode_force_tuple, read_structure_cell, publish_charge_intent, decay_for_kind,
  diffusion_share_for_kind
} from "../../../_as/mod.ts";

@external("index", "trace_atom")
declare function trace_atom(
  idx: i32,
  opcode: i32,
  gx: i32,
  gy: i32,
  targetIdx: i32,
): void;


import { fast_abs, fast_min, fast_max, fast_sign, math_sin, math_cos, execute_atom as vm_execute_atom, build_spatial_hash as core_build_spatial_hash } from "../../../_as/mod.ts";
import { WORLD_MAX_X, WORLD_MAX_Y, clamp_world_x, clamp_world_y, store_clamped_pos, dir4_x, dir4_y, dir8_x, dir8_y, in_grid } from "../../../_as/mod.ts";
import {
  RESOURCE_MAX, clamp_resource, get_energy, set_energy, genome_key16,
  get_resonance, set_resonance, get_phase, set_phase, get_lineage, add_resonance,
  get_hormone, get_x, get_y, get_read_x, get_read_y, get_read_energy, get_read_resonance,
  add_energy_delta, add_resonance_delta, get_logic_byte, get_bond_target, set_bond_target,
  get_bond_stiffness, set_bond_stiffness, get_spatial_grid_count, get_spatial_grid_atom,
  get_reg, set_reg, get_p_c, set_p_c, get_pending_syscall, set_pending_syscall,
  set_bond_dist, set_damping, get_role, set_role, set_hive_memory, get_hive_memory,
  get_hive_balance, add_hive_balance
} from "../../../_as/mod.ts";

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


const STRUCTURE_INTENT_LOCK_BIT: i32 = -2147483648;
const STRUCTURE_INTENT_OWNER_MASK: i32 = 0x7FFFFFFF;
const STRUCTURE_INTENT_SPIN_LIMIT: i32 = 128;










import { evaluate_opcodes } from "./vm.ts";

function lcgNext(seed: u32): u32 {
  return seed * 1664525 + 1013904223;
}

function genomePoolSlot(atomIdx: i32): i32 {
  let hash: u32 = 2166136261;
  for (let i = 0; i < 8; i++) {
    hash = (hash ^ (get_logic_byte(atomIdx, i) as u32)) * 16777619;
  }
  return (hash & 255) as i32;
}



const ROLE_NEUTRAL: u8 = 0;
const ROLE_PRODUCER: u8 = 1;
const ROLE_GUARDIAN: u8 = 2;
const ROLE_ARCHITECT: u8 = 3;
const ROLE_PARASITE: u8 = 4;





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





export function execute_atom(atomIndex: i32): void {
  vm_execute_atom(atomIndex);
}

let spatialHashOverflowCount: i32 = 0;
let spatialHashMaxCellCount: i32 = 0;

export function get_spatial_hash_overflow_count(): i32 {
  return spatialHashOverflowCount;
}

export function get_spatial_hash_max_cell_count(): i32 {
  return spatialHashMaxCellCount;
}

export function build_spatial_hash(): void {
  const result: i64 = core_build_spatial_hash();
  spatialHashMaxCellCount = (result >> 32) as i32;
  spatialHashOverflowCount = (result & 0xFFFFFFFF) as i32;
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

        if (in_grid(nx, ny)) {
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
          let nx = x + dir8_x(n);
          let ny = y + dir8_y(n);
          if (in_grid(nx, ny)) {
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
          let nx = x + dir4_x(n);
          let ny = y + dir4_y(n);
          if (in_grid(nx, ny)) {
            let ni = ny * GRID_W + nx;
            let nCharge = read_structure_charge(ni);
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

        if (in_grid(nx, ny)) {
          let ni = ny * GRID_W + nx;
          let nCharge = read_structure_charge(ni);
          let flow = nCharge - 5;
          if (flow > nextCharge) nextCharge = flow;
        }
      } else if (type == STR_INVERTER) {
        let maxNeighborCharge: i32 = 0;
        for (let n = 0; n < 4; n++) {
          let nx = x + dir4_x(n);
          let ny = y + dir4_y(n);
          if (in_grid(nx, ny)) {
            let ni = ny * GRID_W + nx;
            let nCharge = read_structure_charge(ni);
            if (nCharge > maxNeighborCharge) maxNeighborCharge = nCharge;
          }
        }
        if (maxNeighborCharge < 50) nextCharge = 255;
        else nextCharge = 0;
      } else if (type == STR_LATCH) {
        let newState = state;
        // n=0 (Left): SET
        let setX = x + dir4_x(0);
        let setY = y + dir4_y(0);
        if (in_grid(setX, setY)) {
          if (read_structure_charge(setY * GRID_W + setX) > 100) newState = 1;
        }
        // n=1 (Right): RESET
        let rstX = x + dir4_x(1);
        let rstY = y + dir4_y(1);
        if (in_grid(rstX, rstY)) {
          if (read_structure_charge(rstY * GRID_W + rstX) > 100) newState = 0;
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
          let nx = x + dir4_x(n);
          let ny = y + dir4_y(n);
          if (in_grid(nx, ny)) {
            let ni = ny * GRID_W + nx;
            let nCharge = read_structure_charge(ni);
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
  glyph_transport(tick);
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
      atomic.store<i32>(ENERGY_OFFSET + deltaOff, clamp_resource(nextEnergy));
    }

    const dr = atomic.load<i32>(RESONANCE_DELTA_OFF + deltaOff);
    if (dr != 0) {
      atomic.store<i32>(RESONANCE_DELTA_OFF + deltaOff, 0);
      const nextRes = (atomic.load<i32>(RESONANCE_OFFSET + deltaOff) as i64) +
        (dr as i64);
      atomic.store<i32>(RESONANCE_OFFSET + deltaOff, clamp_resource(nextRes));
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
  memory.fill(METABOLISM_SCRATCH_OFFSET, 0, (65536 * 4) + 64);
}

export function accumulate_metabolism_stats(startIdx: i32, endIdx: i32): void {
  for (let i = startIdx; i < endIdx; i++) {
    const pId = IDS_OFFSET + (i << 3) as usize;
    if (load<i64>(pId) == 0) continue;

    const key = genome_key16(i);
    // Atomic add to genome frequency map in scratch space
    atomic.add<i32>(METABOLISM_SCRATCH_OFFSET + (key << 2), 1);
    // Atomic add to global population counter (scratch end)
    atomic.add<i32>(METABOLISM_SCRATCH_OFFSET + (65536 * 4), 1);
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
  const population = atomic.load<i32>(METABOLISM_SCRATCH_OFFSET + (65536 * 4));
  if (population == 0) return;

  const overflowActive = spatialOverflowRatio >= overflowThreshold;
  const bandStep = i32(Math.max(1, Math.floor(homeostasisBand / 2)));
  const bondPolarity = symbiosisSigned >= 0 ? 1 : -1;

  for (let i = startIdx; i < endIdx; i++) {
    const pId = IDS_OFFSET + (i << 3) as usize;
    if (load<i64>(pId) == 0) continue;

    const current = get_energy(i);

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
      let gx = cx / SPATIAL_CELL_SIZE;
      let gy = cy / SPATIAL_CELL_SIZE;
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
            set_energy(i, current - transfer);
          }
        }
      } else {
        // Host died. Mitochondria perishes.
        set_energy(i, 0);
        atomic.store<i64>(IDS_OFFSET + (i << 3) as usize, 0);
      }
      continue; // Skip entropy tax and standard homeostasis
    }

    const key = genome_key16(i);
    const sameGenomeCount = atomic.load<i32>(
      METABOLISM_SCRATCH_OFFSET + (key << 2),
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
        if (genome_key16(target) != key) crossGenomeBonds++;
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
    const absDeviation = fast_abs(deviation);

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
        set_energy(i, next);
        // Track stats for telemetry
        atomic.add<i32>(METABOLISM_SCRATCH_OFFSET + (65536 * 4) + 4, 1);
        atomic.add<i32>(METABOLISM_SCRATCH_OFFSET + (65536 * 4) + 8, delta);
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
        sumEnergy += get_energy(node);
        sumResonance += atomic.load<i32>(RESONANCE_OFFSET + (node << 2) as usize);
      }

      const avgEnergy = i32(sumEnergy / tail);
      const avgResonance = i32(sumResonance / tail);
      const totalResonance = i32(sumResonance);

      // 2. Distribute pool & Differentiate Organelles (Morphogenesis)
      for (let k = 0; k < tail; k++) {
        const node = unchecked(componentNodes[k]);
        set_energy(node, avgEnergy);
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
