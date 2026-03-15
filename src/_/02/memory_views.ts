/** SSoT: {@link ../../ontology/memory/memory_views.md} */

import { 
  MAX_ATOMS, 
  SCALE, 
  GRID_CELLS, 
  MAX_LEDGER_EVENTS, 
  HIVE_ENERGY_POOL_SIZE, 
  HIVE_MEMORY_SIZE, 
  MAX_HORMONES, 
  ATOM_GENOME_SIZE, 
  ATOM_INSTRUCTION_SIZE, 
  ATOM_CONTEXT_SIZE,
  WASM_MEMORY_PAGES
} from "../00/SYSTEM_CONSTANTS.ts";
import {
  ATTENTION_FIELD_OFFSET,
  BONDS_OFFSET,
  BOND_DISTANCES_OFFSET,
  BOND_REQUESTS_OFFSET,
  CAUSALITY_OFFSET,
  COHERENCE_OFFSET,
  CONTEXT_OFFSET,
  DAMPING_OFFSET,
  ENERGY_OFFSET,
  EVOLUTION_OFFSET,
  GLYPH_HEADER_OFFSET,
  GLYPH_PAYLOAD_OFFSET,
  HIVE_BALANCE_OFFSET,
  HIVE_ENERGY_POOL_OFFSET,
  HIVE_MEMORY_OFFSET,
  HORMONE_OFFSET,
  IDS_OFFSET,
  INSTRUCTIONS_OFFSET,
  LEDGER_DATA_OFFSET,
  LEDGER_HEAD_OFFSET,
  LINEAGE_OFFSET,
  LOGIC_OFFSET,
  MAILBOX_OFFSET,
  MEMORY_GRID_OFFSET,
  MIN_WASM_MEMORY_PAGES,
  NEURAL_COHERENCE_OFFSET,
  PHASE_OFFSET,
  RESONANCE_OFFSET,
  ROLES_OFFSET,
  SIGNAL_GRID_OFFSET,
  SPATIAL_GRID_OFFSET,
  STIFFNESS_OFFSET,
  STRUCTURE_GRID_OFFSET,
  SYNAPTIC_WEIGHTS_OFFSET,
  SYNC_STATE_OFFSET,
  TICK_COUNTER_OFFSET,
  WASM_MEMORY_BYTES,
  XS_OFFSET,
  YS_OFFSET,
  validateMemoryLayout
} from "../01/OMEGA_MEMORY_LAYOUT.ts";

if (WASM_MEMORY_PAGES < MIN_WASM_MEMORY_PAGES) {
  throw new Error(
    "[STATE_MATRIX] WASM memory too small: pages=" + WASM_MEMORY_PAGES + 
    ", required=" + MIN_WASM_MEMORY_PAGES,
  );
}
const layoutValidation = validateMemoryLayout(
  WASM_MEMORY_BYTES,
);
if (!layoutValidation.ok) {
  throw new Error(
    "[STATE_MATRIX] Invalid OFFSETS memory layout:\\n" +
      layoutValidation.errors.map((entry) => "- " + entry).join("\\n")
  );
}

// Base Buffers for UI/WASM compatibility
export const wasmMemory = new WebAssembly.Memory({
  initial: MIN_WASM_MEMORY_PAGES,
  maximum: WASM_MEMORY_PAGES,
  shared: true,
});
export const sharedBuffer = wasmMemory.buffer as SharedArrayBuffer;

// Expose underlying buffers for UI export
export const idBuffer = new BigUint64Array(sharedBuffer, IDS_OFFSET, MAX_ATOMS).buffer;
export const xBuffer = new Int16Array(sharedBuffer, XS_OFFSET, MAX_ATOMS).buffer;
export const yBuffer = new Int16Array(sharedBuffer, YS_OFFSET, MAX_ATOMS).buffer;
export const energyBuffer = new Int32Array(sharedBuffer, ENERGY_OFFSET, MAX_ATOMS).buffer;
export const resonanceBuffer = new Int32Array(sharedBuffer, RESONANCE_OFFSET, MAX_ATOMS).buffer;
export const phaseBuffer = new Int32Array(sharedBuffer, PHASE_OFFSET, MAX_ATOMS).buffer;
export const logicBuffer = new Uint8Array(sharedBuffer, LOGIC_OFFSET, MAX_ATOMS * ATOM_GENOME_SIZE).buffer;
export const bondBuffer = new Uint32Array(sharedBuffer, BONDS_OFFSET, MAX_ATOMS * 4).buffer;
export const stiffnessBuffer = new Float32Array(sharedBuffer, STIFFNESS_OFFSET, MAX_ATOMS * 4).buffer;
export const bondDistBuffer = new Uint8Array(sharedBuffer, BOND_DISTANCES_OFFSET, MAX_ATOMS * 4).buffer;
export const synapticWeightBuffer = new Uint8Array(sharedBuffer, SYNAPTIC_WEIGHTS_OFFSET, MAX_ATOMS * 4).buffer;
export const dampingBuffer = new Uint8Array(sharedBuffer, DAMPING_OFFSET, MAX_ATOMS).buffer;
export const causalityBuffer = new Uint8Array(sharedBuffer, CAUSALITY_OFFSET, MAX_ATOMS).buffer;
export const roleBuffer = new Uint8Array(sharedBuffer, ROLES_OFFSET, MAX_ATOMS).buffer;
export const hiveMemoryBuffer = new Uint8Array(sharedBuffer, HIVE_MEMORY_OFFSET, HIVE_MEMORY_SIZE).buffer;
export const hiveBalanceBuffer = new Int32Array(sharedBuffer, HIVE_BALANCE_OFFSET, 1).buffer;
export const hiveEnergyPoolBuffer = new Int32Array(sharedBuffer, HIVE_ENERGY_POOL_OFFSET, HIVE_ENERGY_POOL_SIZE).buffer;
export const memoryGridBuffer = new Uint8Array(sharedBuffer, MEMORY_GRID_OFFSET, GRID_CELLS * 8).buffer;
export const signalGridBuffer = new Int32Array(sharedBuffer, SIGNAL_GRID_OFFSET, GRID_CELLS).buffer;
export const structureGridBuffer = new Int32Array(sharedBuffer, STRUCTURE_GRID_OFFSET, GRID_CELLS).buffer;
export const attentionFieldBuffer = new Float32Array(sharedBuffer, ATTENTION_FIELD_OFFSET, GRID_CELLS).buffer;
export const glyphHeaderBuffer = new Int32Array(sharedBuffer, GLYPH_HEADER_OFFSET, GRID_CELLS).buffer;
export const glyphPayloadBuffer = new Uint8Array(sharedBuffer, GLYPH_PAYLOAD_OFFSET, GRID_CELLS * 8).buffer;
export const coherenceBuffer = new Int32Array(sharedBuffer, COHERENCE_OFFSET, 1).buffer;
export const neuralCoherenceBuffer = new Int32Array(sharedBuffer, NEURAL_COHERENCE_OFFSET, 1).buffer;
export const hormoneBuffer = new Uint16Array(sharedBuffer, HORMONE_OFFSET, MAX_HORMONES).buffer;
export const lineageBuffer = new BigUint64Array(sharedBuffer, LINEAGE_OFFSET, MAX_ATOMS).buffer;
export const mailboxBuffer = new Int32Array(sharedBuffer, MAILBOX_OFFSET, MAX_ATOMS * 2).buffer;

// TypedArray Views (Host side)
export const ids = new BigUint64Array(sharedBuffer, IDS_OFFSET, MAX_ATOMS);
export const xs = new Int16Array(sharedBuffer, XS_OFFSET, MAX_ATOMS);
export const ys = new Int16Array(sharedBuffer, YS_OFFSET, MAX_ATOMS);
export const energies = new Int32Array(sharedBuffer, ENERGY_OFFSET, MAX_ATOMS);
export const resonances = new Int32Array(sharedBuffer, RESONANCE_OFFSET, MAX_ATOMS);
export const phases = new Int32Array(sharedBuffer, PHASE_OFFSET, MAX_ATOMS);
export const evolutionReserved = new Int32Array(sharedBuffer, EVOLUTION_OFFSET, MAX_ATOMS);
export const roles = new Uint8Array(sharedBuffer, ROLES_OFFSET, MAX_ATOMS);
export const synapticWeights = new Uint8Array(sharedBuffer, SYNAPTIC_WEIGHTS_OFFSET, MAX_ATOMS * 4);
export const logic = new Uint8Array(sharedBuffer, LOGIC_OFFSET, MAX_ATOMS * ATOM_GENOME_SIZE);
export const bonds = new Uint32Array(sharedBuffer, BONDS_OFFSET, MAX_ATOMS * 4);
export const bondStiffness = new Float32Array(sharedBuffer, STIFFNESS_OFFSET, MAX_ATOMS * 4);
export const bondDistances = new Uint8Array(sharedBuffer, BOND_DISTANCES_OFFSET, MAX_ATOMS * 4);
export const bondRequests = new Int32Array(sharedBuffer, BOND_REQUESTS_OFFSET, MAX_ATOMS * 3);
export const damping = new Uint8Array(sharedBuffer, DAMPING_OFFSET, MAX_ATOMS);
export const causality = new Uint8Array(sharedBuffer, CAUSALITY_OFFSET, MAX_ATOMS);
export const hiveMemory = new Uint8Array(sharedBuffer, HIVE_MEMORY_OFFSET, HIVE_MEMORY_SIZE);
export const hiveBalance = new Int32Array(sharedBuffer, HIVE_BALANCE_OFFSET, 1);
export const hiveEnergyPool = new Int32Array(sharedBuffer, HIVE_ENERGY_POOL_OFFSET, HIVE_ENERGY_POOL_SIZE);
export const spatialGrid = new Int32Array(sharedBuffer, SPATIAL_GRID_OFFSET, GRID_CELLS * 32);
export const structureGrid = new Int32Array(sharedBuffer, STRUCTURE_GRID_OFFSET, GRID_CELLS);
export const signalGrid = new Int32Array(sharedBuffer, SIGNAL_GRID_OFFSET, GRID_CELLS);
export const memoryGrid = new Uint8Array(sharedBuffer, MEMORY_GRID_OFFSET, GRID_CELLS * 8);
export const attentionField = new Float32Array(sharedBuffer, ATTENTION_FIELD_OFFSET, GRID_CELLS);
export const glyphHeaders = new Int32Array(sharedBuffer, GLYPH_HEADER_OFFSET, GRID_CELLS);
export const glyphPayload = new Uint8Array(sharedBuffer, GLYPH_PAYLOAD_OFFSET, GRID_CELLS * 8);
export const ledgerHeadView = new Int32Array(sharedBuffer, LEDGER_HEAD_OFFSET, 1);
export const ledgerDataView = new Int32Array(sharedBuffer, LEDGER_DATA_OFFSET, MAX_LEDGER_EVENTS * 4);
export const coherence = new Int32Array(sharedBuffer, COHERENCE_OFFSET, 1);
export const neuralCoherence = new Int32Array(sharedBuffer, NEURAL_COHERENCE_OFFSET, 1);
export const hormones = new Uint16Array(sharedBuffer, HORMONE_OFFSET, MAX_HORMONES);
export const lineage = new BigUint64Array(sharedBuffer, LINEAGE_OFFSET, MAX_ATOMS);
export const mailboxes = new Int32Array(sharedBuffer, MAILBOX_OFFSET, MAX_ATOMS * 2);
export const instructions = new Uint8Array(sharedBuffer, INSTRUCTIONS_OFFSET, MAX_ATOMS * ATOM_INSTRUCTION_SIZE);
export const codeWords = new Uint32Array(sharedBuffer, INSTRUCTIONS_OFFSET, MAX_ATOMS * 16);
export const contexts = new Int32Array(sharedBuffer, CONTEXT_OFFSET, MAX_ATOMS * ATOM_CONTEXT_SIZE);
export const contextByteView = new Uint8Array(sharedBuffer, CONTEXT_OFFSET, MAX_ATOMS * (ATOM_CONTEXT_SIZE * 4));

export const semanticBonuses = new Int32Array(new SharedArrayBuffer(MAX_ATOMS * Int32Array.BYTES_PER_ELEMENT));
export const semanticBonusesBuffer = semanticBonuses.buffer;

export const latticeClearView = new Uint8Array(sharedBuffer, TICK_COUNTER_OFFSET);
export const syncState = new Int32Array(sharedBuffer, SYNC_STATE_OFFSET, 1);
export const tickCounter = new Int32Array(sharedBuffer, TICK_COUNTER_OFFSET, 1);
