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
  diffusion_share_for_kind, get_neural_coherence, set_neural_coherence,
  reset_neural_coherence, clear_secretion_stats, clear_metabolism_stats,
  accumulate_metabolism_stats, apply_metabolism_kernel, tick_structure_grid,
  diffuse_viral_semantics, tick_environment, reduce_atom_deltas
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

export { diffuse_viral_semantics as diffuseViralSemantics };

// Deprecated in favor of tick_environment
export function tick_matrix(): void {
  tick_structure_grid();
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
