// OMEGA-64 | memory_views.ts
import { GRID_W, GRID_H, GRID_CELLS } from "./OFFSETS.ts";
import * as OFFSETS from "./OFFSETS.ts";

const MAX_ATOMS = OFFSETS.MAX_ATOMS;
const SCALE = OFFSETS.SCALE;

if (OFFSETS.WASM_MEMORY_PAGES < OFFSETS.MIN_WASM_MEMORY_PAGES) {
  throw new Error(
    "[STATE_MATRIX] WASM memory too small: pages=" + OFFSETS.WASM_MEMORY_PAGES + 
    ", required=" + OFFSETS.MIN_WASM_MEMORY_PAGES,
  );
}
const layoutValidation = OFFSETS.validateMemoryLayout(
  OFFSETS.WASM_MEMORY_BYTES,
);
if (!layoutValidation.ok) {
  throw new Error(
    "[STATE_MATRIX] Invalid OFFSETS memory layout:\\n" +
      layoutValidation.errors.map((entry) => "- " + entry).join("\\n")
  );
}

// Base Buffers for UI/WASM compatibility
export const wasmMemory = new WebAssembly.Memory({
  initial: OFFSETS.MIN_WASM_MEMORY_PAGES,
  maximum: OFFSETS.WASM_MEMORY_PAGES,
  shared: true,
});
export const sharedBuffer = wasmMemory.buffer as SharedArrayBuffer;

// Expose underlying buffers for UI export
export const idBuffer = new BigUint64Array(sharedBuffer, OFFSETS.IDS_OFFSET, MAX_ATOMS).buffer;
export const xBuffer = new Int16Array(sharedBuffer, OFFSETS.XS_OFFSET, MAX_ATOMS).buffer;
export const yBuffer = new Int16Array(sharedBuffer, OFFSETS.YS_OFFSET, MAX_ATOMS).buffer;
export const energyBuffer = new Int32Array(sharedBuffer, OFFSETS.ENERGY_OFFSET, MAX_ATOMS).buffer;
export const resonanceBuffer = new Int32Array(sharedBuffer, OFFSETS.RESONANCE_OFFSET, MAX_ATOMS).buffer;
export const phaseBuffer = new Int32Array(sharedBuffer, OFFSETS.PHASE_OFFSET, MAX_ATOMS).buffer;
export const logicBuffer = new Uint8Array(sharedBuffer, OFFSETS.LOGIC_OFFSET, MAX_ATOMS * OFFSETS.ATOM_GENOME_SIZE).buffer;
export const bondBuffer = new Uint32Array(sharedBuffer, OFFSETS.BONDS_OFFSET, MAX_ATOMS * 4).buffer;
export const stiffnessBuffer = new Float32Array(sharedBuffer, OFFSETS.STIFFNESS_OFFSET, MAX_ATOMS * 4).buffer;
export const bondDistBuffer = new Uint8Array(sharedBuffer, OFFSETS.BOND_DISTANCES_OFFSET, MAX_ATOMS * 4).buffer;
export const synapticWeightBuffer = new Uint8Array(sharedBuffer, OFFSETS.SYNAPTIC_WEIGHTS_OFFSET, MAX_ATOMS * 4).buffer;
export const dampingBuffer = new Uint8Array(sharedBuffer, OFFSETS.DAMPING_OFFSET, MAX_ATOMS).buffer;
export const causalityBuffer = new Uint8Array(sharedBuffer, OFFSETS.CAUSALITY_OFFSET, MAX_ATOMS).buffer;
export const roleBuffer = new Uint8Array(sharedBuffer, OFFSETS.ROLES_OFFSET, MAX_ATOMS).buffer;
export const hiveMemoryBuffer = new Uint8Array(sharedBuffer, OFFSETS.HIVE_MEMORY_OFFSET, OFFSETS.HIVE_MEMORY_SIZE).buffer;
export const hiveBalanceBuffer = new Int32Array(sharedBuffer, OFFSETS.HIVE_BALANCE_OFFSET, 1).buffer;
export const hiveEnergyPoolBuffer = new Int32Array(sharedBuffer, OFFSETS.HIVE_ENERGY_POOL_OFFSET, OFFSETS.HIVE_ENERGY_POOL_SIZE).buffer;
export const memoryGridBuffer = new Uint8Array(sharedBuffer, OFFSETS.MEMORY_GRID_OFFSET, GRID_CELLS * 8).buffer;
export const signalGridBuffer = new Int32Array(sharedBuffer, OFFSETS.SIGNAL_GRID_OFFSET, GRID_CELLS).buffer;
export const structureGridBuffer = new Int32Array(sharedBuffer, OFFSETS.STRUCTURE_GRID_OFFSET, GRID_CELLS).buffer;
export const attentionFieldBuffer = new Float32Array(sharedBuffer, OFFSETS.ATTENTION_FIELD_OFFSET, GRID_CELLS).buffer;
export const glyphHeaderBuffer = new Int32Array(sharedBuffer, OFFSETS.GLYPH_HEADER_OFFSET, GRID_CELLS).buffer;
export const glyphPayloadBuffer = new Uint8Array(sharedBuffer, OFFSETS.GLYPH_PAYLOAD_OFFSET, GRID_CELLS * 8).buffer;
export const coherenceBuffer = new Int32Array(sharedBuffer, OFFSETS.COHERENCE_OFFSET, 1).buffer;
export const neuralCoherenceBuffer = new Int32Array(sharedBuffer, OFFSETS.NEURAL_COHERENCE_OFFSET, 1).buffer;
export const hormoneBuffer = new Uint16Array(sharedBuffer, OFFSETS.HORMONE_OFFSET, OFFSETS.MAX_HORMONES).buffer;
export const lineageBuffer = new BigUint64Array(sharedBuffer, OFFSETS.LINEAGE_OFFSET, MAX_ATOMS).buffer;
export const mailboxBuffer = new Int32Array(sharedBuffer, OFFSETS.MAILBOX_OFFSET, MAX_ATOMS * 2).buffer;

// TypedArray Views (Host side)
export const ids = new BigUint64Array(sharedBuffer, OFFSETS.IDS_OFFSET, MAX_ATOMS);
export const xs = new Int16Array(sharedBuffer, OFFSETS.XS_OFFSET, MAX_ATOMS);
export const ys = new Int16Array(sharedBuffer, OFFSETS.YS_OFFSET, MAX_ATOMS);
export const energies = new Int32Array(sharedBuffer, OFFSETS.ENERGY_OFFSET, MAX_ATOMS);
export const resonances = new Int32Array(sharedBuffer, OFFSETS.RESONANCE_OFFSET, MAX_ATOMS);
export const phases = new Int32Array(sharedBuffer, OFFSETS.PHASE_OFFSET, MAX_ATOMS);
export const evolutionReserved = new Int32Array(sharedBuffer, OFFSETS.EVOLUTION_OFFSET, MAX_ATOMS);
export const roles = new Uint8Array(sharedBuffer, OFFSETS.ROLES_OFFSET, MAX_ATOMS);
export const synapticWeights = new Uint8Array(sharedBuffer, OFFSETS.SYNAPTIC_WEIGHTS_OFFSET, MAX_ATOMS * 4);
export const logic = new Uint8Array(sharedBuffer, OFFSETS.LOGIC_OFFSET, MAX_ATOMS * OFFSETS.ATOM_GENOME_SIZE);
export const bonds = new Uint32Array(sharedBuffer, OFFSETS.BONDS_OFFSET, MAX_ATOMS * 4);
export const bondStiffness = new Float32Array(sharedBuffer, OFFSETS.STIFFNESS_OFFSET, MAX_ATOMS * 4);
export const bondDistances = new Uint8Array(sharedBuffer, OFFSETS.BOND_DISTANCES_OFFSET, MAX_ATOMS * 4);
export const bondRequests = new Int32Array(sharedBuffer, OFFSETS.BOND_REQUESTS_OFFSET, MAX_ATOMS * 3);
export const damping = new Uint8Array(sharedBuffer, OFFSETS.DAMPING_OFFSET, MAX_ATOMS);
export const causality = new Uint8Array(sharedBuffer, OFFSETS.CAUSALITY_OFFSET, MAX_ATOMS);
export const hiveMemory = new Uint8Array(sharedBuffer, OFFSETS.HIVE_MEMORY_OFFSET, OFFSETS.HIVE_MEMORY_SIZE);
export const hiveBalance = new Int32Array(sharedBuffer, OFFSETS.HIVE_BALANCE_OFFSET, 1);
export const hiveEnergyPool = new Int32Array(sharedBuffer, OFFSETS.HIVE_ENERGY_POOL_OFFSET, OFFSETS.HIVE_ENERGY_POOL_SIZE);
export const spatialGrid = new Int32Array(sharedBuffer, OFFSETS.SPATIAL_GRID_OFFSET, GRID_CELLS * 32);
export const structureGrid = new Int32Array(sharedBuffer, OFFSETS.STRUCTURE_GRID_OFFSET, GRID_CELLS);
export const signalGrid = new Int32Array(sharedBuffer, OFFSETS.SIGNAL_GRID_OFFSET, GRID_CELLS);
export const memoryGrid = new Uint8Array(sharedBuffer, OFFSETS.MEMORY_GRID_OFFSET, GRID_CELLS * 8);
export const attentionField = new Float32Array(sharedBuffer, OFFSETS.ATTENTION_FIELD_OFFSET, GRID_CELLS);
export const glyphHeaders = new Int32Array(sharedBuffer, OFFSETS.GLYPH_HEADER_OFFSET, GRID_CELLS);
export const glyphPayload = new Uint8Array(sharedBuffer, OFFSETS.GLYPH_PAYLOAD_OFFSET, GRID_CELLS * 8);
export const ledgerHeadView = new Int32Array(sharedBuffer, OFFSETS.LEDGER_HEAD_OFFSET, 1);
export const ledgerDataView = new Int32Array(sharedBuffer, OFFSETS.LEDGER_DATA_OFFSET, OFFSETS.MAX_LEDGER_EVENTS * 4);
export const coherence = new Int32Array(sharedBuffer, OFFSETS.COHERENCE_OFFSET, 1);
export const neuralCoherence = new Int32Array(sharedBuffer, OFFSETS.NEURAL_COHERENCE_OFFSET, 1);
export const hormones = new Uint16Array(sharedBuffer, OFFSETS.HORMONE_OFFSET, OFFSETS.MAX_HORMONES);
export const lineage = new BigUint64Array(sharedBuffer, OFFSETS.LINEAGE_OFFSET, MAX_ATOMS);
export const mailboxes = new Int32Array(sharedBuffer, OFFSETS.MAILBOX_OFFSET, MAX_ATOMS * 2);
export const instructions = new Uint8Array(sharedBuffer, OFFSETS.INSTRUCTIONS_OFFSET, MAX_ATOMS * OFFSETS.ATOM_INSTRUCTION_SIZE);
export const codeWords = new Uint32Array(sharedBuffer, OFFSETS.INSTRUCTIONS_OFFSET, MAX_ATOMS * 16);
export const contexts = new Int32Array(sharedBuffer, OFFSETS.CONTEXT_OFFSET, MAX_ATOMS * OFFSETS.ATOM_CONTEXT_SIZE);
export const contextByteView = new Uint8Array(sharedBuffer, OFFSETS.CONTEXT_OFFSET, MAX_ATOMS * (OFFSETS.ATOM_CONTEXT_SIZE * 4));

export const semanticBonuses = new Int32Array(new SharedArrayBuffer(MAX_ATOMS * Int32Array.BYTES_PER_ELEMENT));
export const semanticBonusesBuffer = semanticBonuses.buffer;

export const latticeClearView = new Uint8Array(sharedBuffer, OFFSETS.TICK_COUNTER_OFFSET);
export const syncState = new Int32Array(sharedBuffer, OFFSETS.SYNC_STATE_OFFSET, 1);
export const tickCounter = new Int32Array(sharedBuffer, OFFSETS.TICK_COUNTER_OFFSET, 1);
