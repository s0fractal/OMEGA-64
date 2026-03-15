/** SSoT: {@link ../../ontology/core/OMEGA_MEMORY_LAYOUT.md} */
import { MAX_ATOMS, SAFETY_BUFFER, ATOM_GENOME_SIZE, ATOM_INSTRUCTION_SIZE, ATOM_CONTEXT_SIZE, MAX_SPAWN_REQUESTS, MAX_MEIOSIS_EVENTS, GRID_CELLS, MAX_ASCENSION_STATS_RESERVED, HIVE_MEMORY_SIZE, HIVE_ENERGY_POOL_SIZE, MAX_HORMONES, SECRETION_STATS_SIZE, MAX_LEDGER_EVENTS, MAX_EGRESS_EVENTS } from "../00/mod.ts";

// Memory Layout: OMEGA_MEMORY_LAYOUT
export const TICK_COUNTER_OFFSET: number = ((SAFETY_BUFFER - 8) + 4 - 1) & ~(4 - 1);
export const TICK_COUNTER_OFF: number = TICK_COUNTER_OFFSET;
export const SYNC_STATE_OFFSET: number = ((TICK_COUNTER_OFFSET + (4)) + 4 - 1) & ~(4 - 1);
export const SYNC_STATE_OFF: number = SYNC_STATE_OFFSET;
export const IDS_OFFSET: number = ((SYNC_STATE_OFFSET + (4)) + 8 - 1) & ~(8 - 1);
export const IDS_OFF: number = IDS_OFFSET;
export const XS_OFFSET: number = ((IDS_OFFSET + (MAX_ATOMS * 8)) + 2 - 1) & ~(2 - 1);
export const XS_OFF: number = XS_OFFSET;
export const YS_OFFSET: number = ((XS_OFFSET + (MAX_ATOMS * 2)) + 2 - 1) & ~(2 - 1);
export const YS_OFF: number = YS_OFFSET;
export const ENERGY_OFFSET: number = ((YS_OFFSET + (MAX_ATOMS * 2)) + 4 - 1) & ~(4 - 1);
export const ENERGY_OFF: number = ENERGY_OFFSET;
export const RESONANCE_OFFSET: number = ((ENERGY_OFFSET + (MAX_ATOMS * 4)) + 4 - 1) & ~(4 - 1);
export const RESONANCE_OFF: number = RESONANCE_OFFSET;
export const PHASE_OFFSET: number = ((RESONANCE_OFFSET + (MAX_ATOMS * 4)) + 4 - 1) & ~(4 - 1);
export const PHASE_OFF: number = PHASE_OFFSET;
export const LOGIC_OFFSET: number = PHASE_OFFSET + (MAX_ATOMS * 4);
export const LOGIC_OFF: number = LOGIC_OFFSET;
export const BONDS_OFFSET: number = ((LOGIC_OFFSET + (MAX_ATOMS * 8)) + 4 - 1) & ~(4 - 1);
export const BONDS_OFF: number = BONDS_OFFSET;
export const STIFFNESS_OFFSET: number = ((BONDS_OFFSET + (MAX_ATOMS * 4 * 4)) + 4 - 1) & ~(4 - 1);
export const STIFFNESS_OFF: number = STIFFNESS_OFFSET;
export const INSTRUCTIONS_OFFSET: number = STIFFNESS_OFFSET + (MAX_ATOMS * 4 * 4);
export const INSTRUCTIONS_OFF: number = INSTRUCTIONS_OFFSET;
export const GENOMES_OFFSET: number = INSTRUCTIONS_OFFSET;
export const CONTEXT_OFFSET: number = ((INSTRUCTIONS_OFFSET + (MAX_ATOMS * 64)) + 4 - 1) & ~(4 - 1);
export const CONTEXT_OFF: number = CONTEXT_OFFSET;
export const EVOLUTION_OFFSET: number = ((CONTEXT_OFFSET + (MAX_ATOMS * 16 * 4)) + 4 - 1) & ~(4 - 1);
export const EVOLUTION_OFF: number = EVOLUTION_OFFSET;
export const INTENT_OFFSET: number = EVOLUTION_OFFSET;
export const SPAWN_REQUESTS_OFFSET: number = ((EVOLUTION_OFFSET + (MAX_ATOMS * 4)) + 8 - 1) & ~(8 - 1);
export const SPAWN_REQUESTS_OFF: number = SPAWN_REQUESTS_OFFSET;
export const SPAWN_GRID_OFF: number = SPAWN_REQUESTS_OFFSET;
export const SPAWN_HEAD_OFF: number = SPAWN_REQUESTS_OFFSET;
export const SPAWN_DATA_OFF: number = SPAWN_REQUESTS_OFFSET + 8;
export const MEIOSIS_RESERVED_OFFSET: number = ((SPAWN_REQUESTS_OFFSET + (8 + (1024 * 24))) + 4 - 1) & ~(4 - 1);
export const MEIOSIS_RESERVED_OFF: number = MEIOSIS_RESERVED_OFFSET;
export const BOND_REQUESTS_OFFSET: number = ((MEIOSIS_RESERVED_OFFSET + (75000 * 80)) + 4 - 1) & ~(4 - 1);
export const BOND_REQUESTS_OFF: number = BOND_REQUESTS_OFFSET;
export const SPATIAL_GRID_OFFSET: number = ((BOND_REQUESTS_OFFSET + (MAX_ATOMS * 3 * 4)) + 4 - 1) & ~(4 - 1);
export const SPATIAL_GRID_OFF: number = SPATIAL_GRID_OFFSET;
export const ROLES_OFFSET: number = SPATIAL_GRID_OFFSET + (GRID_CELLS * 32 * 4);
export const ROLES_OFF: number = ROLES_OFFSET;
export const STRUCTURE_GRID_OFFSET: number = ((ROLES_OFFSET + (MAX_ATOMS)) + 4 - 1) & ~(4 - 1);
export const STRUCTURE_GRID_OFF: number = STRUCTURE_GRID_OFFSET;
export const SIGNAL_GRID_OFFSET: number = ((STRUCTURE_GRID_OFFSET + (GRID_CELLS * 4)) + 4 - 1) & ~(4 - 1);
export const SIGNAL_GRID_OFF: number = SIGNAL_GRID_OFFSET;
export const MEMORY_GRID_OFFSET: number = SIGNAL_GRID_OFFSET + (GRID_CELLS * 4);
export const MEMORY_GRID_OFF: number = MEMORY_GRID_OFFSET;
export const ASCENSION_STATS_RESERVED_OFFSET: number = ((MEMORY_GRID_OFFSET + (GRID_CELLS * 8)) + 4 - 1) & ~(4 - 1);
export const ASCENSION_STATS_RESERVED_OFF: number = ASCENSION_STATS_RESERVED_OFFSET;
export const ASCENSION_STATS_OFFSET: number = ASCENSION_STATS_RESERVED_OFFSET;
export const ASCENSION_STATS_OFF: number = ASCENSION_STATS_RESERVED_OFFSET;
export const BOND_DISTANCES_OFFSET: number = ASCENSION_STATS_RESERVED_OFFSET + (1250000 * 4);
export const BOND_DISTANCES_OFF: number = BOND_DISTANCES_OFFSET;
export const SYNAPTIC_WEIGHTS_OFFSET: number = BOND_DISTANCES_OFFSET + (MAX_ATOMS * 4);
export const SYNAPTIC_WEIGHTS_OFF: number = SYNAPTIC_WEIGHTS_OFFSET;
export const DAMPING_OFFSET: number = SYNAPTIC_WEIGHTS_OFFSET + (MAX_ATOMS * 4);
export const DAMPING_OFF: number = DAMPING_OFFSET;
export const CAUSALITY_OFFSET: number = DAMPING_OFFSET + (MAX_ATOMS);
export const CAUSALITY_OFF: number = CAUSALITY_OFFSET;
export const HIVE_MEMORY_OFFSET: number = CAUSALITY_OFFSET + (MAX_ATOMS);
export const HIVE_MEMORY_OFF: number = HIVE_MEMORY_OFFSET;
export const HIVE_BALANCE_OFFSET: number = ((HIVE_MEMORY_OFFSET + (1024)) + 4 - 1) & ~(4 - 1);
export const HIVE_BALANCE_OFF: number = HIVE_BALANCE_OFFSET;
export const QUORUM_OFFSET: number = ((HIVE_BALANCE_OFFSET + (4)) + 4 - 1) & ~(4 - 1);
export const QUORUM_OFF: number = QUORUM_OFFSET;
export const COHERENCE_OFFSET: number = ((QUORUM_OFFSET + (GRID_CELLS * 8 * 4)) + 4 - 1) & ~(4 - 1);
export const COHERENCE_OFF: number = COHERENCE_OFFSET;
export const NEURAL_COHERENCE_OFFSET: number = ((COHERENCE_OFFSET + (4)) + 4 - 1) & ~(4 - 1);
export const NEURAL_COHERENCE_OFF: number = NEURAL_COHERENCE_OFFSET;
export const PHYSICS_READ_XS_OFFSET: number = ((NEURAL_COHERENCE_OFFSET + (4)) + 2 - 1) & ~(2 - 1);
export const PHYSICS_READ_XS_OFF: number = PHYSICS_READ_XS_OFFSET;
export const PHYSICS_READ_YS_OFFSET: number = ((PHYSICS_READ_XS_OFFSET + (MAX_ATOMS * 2)) + 2 - 1) & ~(2 - 1);
export const PHYSICS_READ_YS_OFF: number = PHYSICS_READ_YS_OFFSET;
export const PHYSICS_READ_ENERGY_OFFSET: number = ((PHYSICS_READ_YS_OFFSET + (MAX_ATOMS * 2)) + 4 - 1) & ~(4 - 1);
export const PHYSICS_READ_ENERGY_OFF: number = PHYSICS_READ_ENERGY_OFFSET;
export const PHYSICS_READ_RESONANCE_OFFSET: number = ((PHYSICS_READ_ENERGY_OFFSET + (MAX_ATOMS * 4)) + 4 - 1) & ~(4 - 1);
export const PHYSICS_READ_RESONANCE_OFF: number = PHYSICS_READ_RESONANCE_OFFSET;
export const ENERGY_DELTA_OFFSET: number = ((PHYSICS_READ_RESONANCE_OFFSET + (MAX_ATOMS * 4)) + 4 - 1) & ~(4 - 1);
export const ENERGY_DELTA_OFF: number = ENERGY_DELTA_OFFSET;
export const RESONANCE_DELTA_OFFSET: number = ((ENERGY_DELTA_OFFSET + (MAX_ATOMS * 4)) + 4 - 1) & ~(4 - 1);
export const RESONANCE_DELTA_OFF: number = RESONANCE_DELTA_OFFSET;
export const STRUCTURE_BUILD_OWNER_OFFSET: number = ((RESONANCE_DELTA_OFFSET + (MAX_ATOMS * 4)) + 4 - 1) & ~(4 - 1);
export const STRUCTURE_BUILD_OWNER_OFF: number = STRUCTURE_BUILD_OWNER_OFFSET;
export const STRUCTURE_BUILD_VALUE_OFFSET: number = ((STRUCTURE_BUILD_OWNER_OFFSET + (GRID_CELLS * 4)) + 4 - 1) & ~(4 - 1);
export const STRUCTURE_BUILD_VALUE_OFF: number = STRUCTURE_BUILD_VALUE_OFFSET;
export const STRUCTURE_CHARGE_INTENT_OFFSET: number = ((STRUCTURE_BUILD_VALUE_OFFSET + (GRID_CELLS * 4)) + 4 - 1) & ~(4 - 1);
export const STRUCTURE_CHARGE_INTENT_OFF: number = STRUCTURE_CHARGE_INTENT_OFFSET;
export const ATTENTION_FIELD_OFFSET: number = ((STRUCTURE_CHARGE_INTENT_OFFSET + (GRID_CELLS * 4)) + 4 - 1) & ~(4 - 1);
export const ATTENTION_FIELD_OFF: number = ATTENTION_FIELD_OFFSET;
export const HIVE_ENERGY_POOL_OFFSET: number = ((ATTENTION_FIELD_OFFSET + (GRID_CELLS * 4)) + 4 - 1) & ~(4 - 1);
export const HIVE_ENERGY_POOL_OFF: number = HIVE_ENERGY_POOL_OFFSET;
export const GLYPH_HEADER_OFFSET: number = ((HIVE_ENERGY_POOL_OFFSET + (256 * 4)) + 4 - 1) & ~(4 - 1);
export const GLYPH_HEADER_OFF: number = GLYPH_HEADER_OFFSET;
export const GLYPH_PAYLOAD_OFFSET: number = GLYPH_HEADER_OFFSET + (GRID_CELLS * 4);
export const GLYPH_PAYLOAD_OFF: number = GLYPH_PAYLOAD_OFFSET;
export const GLYPH_SCRATCH_HEADER_OFFSET: number = ((GLYPH_PAYLOAD_OFFSET + (GRID_CELLS * 8)) + 4 - 1) & ~(4 - 1);
export const GLYPH_SCRATCH_HEADER_OFF: number = GLYPH_SCRATCH_HEADER_OFFSET;
export const GLYPH_SCRATCH_PAYLOAD_OFFSET: number = GLYPH_SCRATCH_HEADER_OFFSET + (GRID_CELLS * 4);
export const GLYPH_SCRATCH_PAYLOAD_OFF: number = GLYPH_SCRATCH_PAYLOAD_OFFSET;
export const HORMONES_OFFSET: number = ((GLYPH_SCRATCH_PAYLOAD_OFFSET + (GRID_CELLS * 8)) + 2 - 1) & ~(2 - 1);
export const HORMONES_OFF: number = HORMONES_OFFSET;
export const HORMONE_OFFSET: number = HORMONES_OFFSET;
export const HORMONE_OFF: number = HORMONES_OFFSET;
export const SECRETION_STATS_OFFSET: number = ((HORMONES_OFFSET + (8 * 2)) + 4 - 1) & ~(4 - 1);
export const SECRETION_STATS_OFF: number = SECRETION_STATS_OFFSET;
export const LINEAGE_OFFSET: number = ((SECRETION_STATS_OFFSET + (12 * 4)) + 8 - 1) & ~(8 - 1);
export const LINEAGE_OFF: number = LINEAGE_OFFSET;
export const MAILBOX_OFFSET: number = ((LINEAGE_OFFSET + (MAX_ATOMS * 8)) + 4 - 1) & ~(4 - 1);
export const MAILBOX_OFF: number = MAILBOX_OFFSET;
export const LEDGER_HEAD_OFFSET: number = ((MAILBOX_OFFSET + (MAX_ATOMS * 8)) + 4 - 1) & ~(4 - 1);
export const LEDGER_HEAD_OFF: number = LEDGER_HEAD_OFFSET;
export const LEDGER_DATA_OFFSET: number = ((LEDGER_HEAD_OFFSET + (4)) + 4 - 1) & ~(4 - 1);
export const LEDGER_DATA_OFF: number = LEDGER_DATA_OFFSET;
export const EGRESS_HEAD_OFFSET: number = ((LEDGER_DATA_OFFSET + (65536 * 16)) + 4 - 1) & ~(4 - 1);
export const EGRESS_HEAD_OFF: number = EGRESS_HEAD_OFFSET;
export const EGRESS_DATA_OFFSET: number = ((EGRESS_HEAD_OFFSET + (4)) + 4 - 1) & ~(4 - 1);
export const EGRESS_DATA_OFF: number = EGRESS_DATA_OFFSET;
export const METABOLISM_SCRATCH_OFFSET: number = ((EGRESS_DATA_OFFSET + (8192 * 128)) + 4 - 1) & ~(4 - 1);
export const METABOLISM_SCRATCH_OFF: number = METABOLISM_SCRATCH_OFFSET;
export const LATTICE_MEMORY_END: number = METABOLISM_SCRATCH_OFFSET + ((65536 * 4) + 128);
export const MIN_WASM_MEMORY_PAGES: number = Math.max(2600, Math.ceil((METABOLISM_SCRATCH_OFFSET + ((65536 * 4) + 128)) / (64 * 1024)));
export const WASM_MEMORY_BYTES: number = MIN_WASM_MEMORY_PAGES * (64 * 1024);

export function validateMemoryLayout(memorySize: number) {
  const regions = [
    { name: "TICK_COUNTER", offset: TICK_COUNTER_OFFSET, expectedSize: SYNC_STATE_OFFSET - TICK_COUNTER_OFFSET },
    { name: "SYNC_STATE", offset: SYNC_STATE_OFFSET, expectedSize: IDS_OFFSET - SYNC_STATE_OFFSET },
    { name: "IDS", offset: IDS_OFFSET, expectedSize: XS_OFFSET - IDS_OFFSET },
    { name: "XS", offset: XS_OFFSET, expectedSize: YS_OFFSET - XS_OFFSET },
    { name: "YS", offset: YS_OFFSET, expectedSize: ENERGY_OFFSET - YS_OFFSET },
    { name: "ENERGY", offset: ENERGY_OFFSET, expectedSize: RESONANCE_OFFSET - ENERGY_OFFSET },
    { name: "RESONANCE", offset: RESONANCE_OFFSET, expectedSize: PHASE_OFFSET - RESONANCE_OFFSET },
    { name: "PHASE", offset: PHASE_OFFSET, expectedSize: LOGIC_OFFSET - PHASE_OFFSET },
    { name: "LOGIC", offset: LOGIC_OFFSET, expectedSize: BONDS_OFFSET - LOGIC_OFFSET },
    { name: "BONDS", offset: BONDS_OFFSET, expectedSize: STIFFNESS_OFFSET - BONDS_OFFSET },
    { name: "STIFFNESS", offset: STIFFNESS_OFFSET, expectedSize: INSTRUCTIONS_OFFSET - STIFFNESS_OFFSET },
    { name: "INSTRUCTIONS", offset: INSTRUCTIONS_OFFSET, expectedSize: CONTEXT_OFFSET - INSTRUCTIONS_OFFSET },
    { name: "CONTEXT", offset: CONTEXT_OFFSET, expectedSize: EVOLUTION_OFFSET - CONTEXT_OFFSET },
    { name: "EVOLUTION", offset: EVOLUTION_OFFSET, expectedSize: SPAWN_REQUESTS_OFFSET - EVOLUTION_OFFSET },
    { name: "SPAWN_REQUESTS", offset: SPAWN_REQUESTS_OFFSET, expectedSize: MEIOSIS_RESERVED_OFFSET - SPAWN_REQUESTS_OFFSET },
    { name: "MEIOSIS_RESERVED", offset: MEIOSIS_RESERVED_OFFSET, expectedSize: BOND_REQUESTS_OFFSET - MEIOSIS_RESERVED_OFFSET },
    { name: "BOND_REQUESTS", offset: BOND_REQUESTS_OFFSET, expectedSize: SPATIAL_GRID_OFFSET - BOND_REQUESTS_OFFSET },
    { name: "SPATIAL_GRID", offset: SPATIAL_GRID_OFFSET, expectedSize: ROLES_OFFSET - SPATIAL_GRID_OFFSET },
    { name: "ROLES", offset: ROLES_OFFSET, expectedSize: STRUCTURE_GRID_OFFSET - ROLES_OFFSET },
    { name: "STRUCTURE_GRID", offset: STRUCTURE_GRID_OFFSET, expectedSize: SIGNAL_GRID_OFFSET - STRUCTURE_GRID_OFFSET },
    { name: "SIGNAL_GRID", offset: SIGNAL_GRID_OFFSET, expectedSize: MEMORY_GRID_OFFSET - SIGNAL_GRID_OFFSET },
    { name: "MEMORY_GRID", offset: MEMORY_GRID_OFFSET, expectedSize: ASCENSION_STATS_RESERVED_OFFSET - MEMORY_GRID_OFFSET },
    { name: "ASCENSION_STATS_RESERVED", offset: ASCENSION_STATS_RESERVED_OFFSET, expectedSize: BOND_DISTANCES_OFFSET - ASCENSION_STATS_RESERVED_OFFSET },
    { name: "BOND_DISTANCES", offset: BOND_DISTANCES_OFFSET, expectedSize: SYNAPTIC_WEIGHTS_OFFSET - BOND_DISTANCES_OFFSET },
    { name: "SYNAPTIC_WEIGHTS", offset: SYNAPTIC_WEIGHTS_OFFSET, expectedSize: DAMPING_OFFSET - SYNAPTIC_WEIGHTS_OFFSET },
    { name: "DAMPING", offset: DAMPING_OFFSET, expectedSize: CAUSALITY_OFFSET - DAMPING_OFFSET },
    { name: "CAUSALITY", offset: CAUSALITY_OFFSET, expectedSize: HIVE_MEMORY_OFFSET - CAUSALITY_OFFSET },
    { name: "HIVE_MEMORY", offset: HIVE_MEMORY_OFFSET, expectedSize: HIVE_BALANCE_OFFSET - HIVE_MEMORY_OFFSET },
    { name: "HIVE_BALANCE", offset: HIVE_BALANCE_OFFSET, expectedSize: QUORUM_OFFSET - HIVE_BALANCE_OFFSET },
    { name: "QUORUM", offset: QUORUM_OFFSET, expectedSize: COHERENCE_OFFSET - QUORUM_OFFSET },
    { name: "COHERENCE", offset: COHERENCE_OFFSET, expectedSize: NEURAL_COHERENCE_OFFSET - COHERENCE_OFFSET },
    { name: "NEURAL_COHERENCE", offset: NEURAL_COHERENCE_OFFSET, expectedSize: PHYSICS_READ_XS_OFFSET - NEURAL_COHERENCE_OFFSET },
    { name: "PHYSICS_READ_XS", offset: PHYSICS_READ_XS_OFFSET, expectedSize: PHYSICS_READ_YS_OFFSET - PHYSICS_READ_XS_OFFSET },
    { name: "PHYSICS_READ_YS", offset: PHYSICS_READ_YS_OFFSET, expectedSize: PHYSICS_READ_ENERGY_OFFSET - PHYSICS_READ_YS_OFFSET },
    { name: "PHYSICS_READ_ENERGY", offset: PHYSICS_READ_ENERGY_OFFSET, expectedSize: PHYSICS_READ_RESONANCE_OFFSET - PHYSICS_READ_ENERGY_OFFSET },
    { name: "PHYSICS_READ_RESONANCE", offset: PHYSICS_READ_RESONANCE_OFFSET, expectedSize: ENERGY_DELTA_OFFSET - PHYSICS_READ_RESONANCE_OFFSET },
    { name: "ENERGY_DELTA", offset: ENERGY_DELTA_OFFSET, expectedSize: RESONANCE_DELTA_OFFSET - ENERGY_DELTA_OFFSET },
    { name: "RESONANCE_DELTA", offset: RESONANCE_DELTA_OFFSET, expectedSize: STRUCTURE_BUILD_OWNER_OFFSET - RESONANCE_DELTA_OFFSET },
    { name: "STRUCTURE_BUILD_OWNER", offset: STRUCTURE_BUILD_OWNER_OFFSET, expectedSize: STRUCTURE_BUILD_VALUE_OFFSET - STRUCTURE_BUILD_OWNER_OFFSET },
    { name: "STRUCTURE_BUILD_VALUE", offset: STRUCTURE_BUILD_VALUE_OFFSET, expectedSize: STRUCTURE_CHARGE_INTENT_OFFSET - STRUCTURE_BUILD_VALUE_OFFSET },
    { name: "STRUCTURE_CHARGE_INTENT", offset: STRUCTURE_CHARGE_INTENT_OFFSET, expectedSize: ATTENTION_FIELD_OFFSET - STRUCTURE_CHARGE_INTENT_OFFSET },
    { name: "ATTENTION_FIELD", offset: ATTENTION_FIELD_OFFSET, expectedSize: HIVE_ENERGY_POOL_OFFSET - ATTENTION_FIELD_OFFSET },
    { name: "HIVE_ENERGY_POOL", offset: HIVE_ENERGY_POOL_OFFSET, expectedSize: GLYPH_HEADER_OFFSET - HIVE_ENERGY_POOL_OFFSET },
    { name: "GLYPH_HEADER", offset: GLYPH_HEADER_OFFSET, expectedSize: GLYPH_PAYLOAD_OFFSET - GLYPH_HEADER_OFFSET },
    { name: "GLYPH_PAYLOAD", offset: GLYPH_PAYLOAD_OFFSET, expectedSize: GLYPH_SCRATCH_HEADER_OFFSET - GLYPH_PAYLOAD_OFFSET },
    { name: "GLYPH_SCRATCH_HEADER", offset: GLYPH_SCRATCH_HEADER_OFFSET, expectedSize: GLYPH_SCRATCH_PAYLOAD_OFFSET - GLYPH_SCRATCH_HEADER_OFFSET },
    { name: "GLYPH_SCRATCH_PAYLOAD", offset: GLYPH_SCRATCH_PAYLOAD_OFFSET, expectedSize: HORMONES_OFFSET - GLYPH_SCRATCH_PAYLOAD_OFFSET },
    { name: "HORMONES", offset: HORMONES_OFFSET, expectedSize: SECRETION_STATS_OFFSET - HORMONES_OFFSET },
    { name: "SECRETION_STATS", offset: SECRETION_STATS_OFFSET, expectedSize: LINEAGE_OFFSET - SECRETION_STATS_OFFSET },
    { name: "LINEAGE", offset: LINEAGE_OFFSET, expectedSize: MAILBOX_OFFSET - LINEAGE_OFFSET },
    { name: "MAILBOX", offset: MAILBOX_OFFSET, expectedSize: LEDGER_HEAD_OFFSET - MAILBOX_OFFSET },
    { name: "LEDGER_HEAD", offset: LEDGER_HEAD_OFFSET, expectedSize: LEDGER_DATA_OFFSET - LEDGER_HEAD_OFFSET },
    { name: "LEDGER_DATA", offset: LEDGER_DATA_OFFSET, expectedSize: EGRESS_HEAD_OFFSET - LEDGER_DATA_OFFSET },
    { name: "EGRESS_HEAD", offset: EGRESS_HEAD_OFFSET, expectedSize: EGRESS_DATA_OFFSET - EGRESS_HEAD_OFFSET },
    { name: "EGRESS_DATA", offset: EGRESS_DATA_OFFSET, expectedSize: METABOLISM_SCRATCH_OFFSET - EGRESS_DATA_OFFSET },
    { name: "METABOLISM_SCRATCH", offset: METABOLISM_SCRATCH_OFFSET, expectedSize: LATTICE_MEMORY_END - METABOLISM_SCRATCH_OFFSET }
  ];
  let ok = true;
  const errors: string[] = [];
  
  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];
    if (i < regions.length - 1) {
      if (region.offset + region.expectedSize !== regions[i+1].offset) {
        ok = false;
        errors.push(`Gap or overlap after ${region.name}. offset=${region.offset} size=${region.expectedSize} next=${regions[i+1].offset}`);
      }
    }
  }
  
  if (LATTICE_MEMORY_END > memorySize) {
    ok = false;
    errors.push(`Memory size (${memorySize}) is too small for lattice (${LATTICE_MEMORY_END})`);
  }

  return { ok, errors, regions, latticeEnd: LATTICE_MEMORY_END };
}
