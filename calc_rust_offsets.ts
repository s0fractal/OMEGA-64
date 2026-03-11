import * as off from "./63_necropolis/mod.ts";

const bounds = {
  ids: off.IDS_OFFSET,
  xs: off.XS_OFFSET,
  ys: off.YS_OFFSET,
  energy: off.ENERGY_OFFSET,
  resonance: off.RESONANCE_OFFSET,
  phase: off.PHASE_OFFSET,
  logic: off.LOGIC_OFFSET,
  bonds: off.BONDS_OFFSET,
  stiffness: off.STIFFNESS_OFFSET,
  instructions: off.INSTRUCTIONS_OFFSET,
  context: off.CONTEXT_OFFSET,
  evolution_reserved: off.EVOLUTION_OFFSET,
  spawn_requests: off.SPAWN_REQUESTS_OFFSET,
  meiosis: off.MEIOSIS_OFFSET,
  bond_requests: off.BOND_REQUESTS_OFFSET,
  spatial_grid: off.SPATIAL_GRID_OFFSET,
  roles: off.ROLES_OFFSET,
  structure_grid: off.STRUCTURE_GRID_OFFSET,
  signal_grid: off.SIGNAL_GRID_OFFSET,
  memory_grid: off.MEMORY_GRID_OFFSET,
  ascension_stats: off.ASCENSION_STATS_OFFSET,
  bond_distances: off.BOND_DISTANCES_OFFSET,
  damping: off.DAMPING_OFFSET,
  causality: off.CAUSALITY_OFFSET,
  hive_memory: off.HIVE_MEMORY_OFFSET,
  hive_balance: off.HIVE_BALANCE_OFFSET,
  quorum: off.QUORUM_OFFSET,
  coherence: off.COHERENCE_OFFSET,
  neural_coherence: off.NEURAL_COHERENCE_OFFSET,
  physics_read_xs: off.PHYSICS_READ_XS_OFFSET,
  physics_read_ys: off.PHYSICS_READ_YS_OFFSET,
  physics_read_energy: off.PHYSICS_READ_ENERGY_OFFSET,
  physics_read_resonance: off.PHYSICS_READ_RESONANCE_OFFSET,
  energy_delta: off.ENERGY_DELTA_OFFSET,
  resonance_delta: off.RESONANCE_DELTA_OFFSET,
  structure_build_owner: off.STRUCTURE_BUILD_OWNER_OFFSET,
  structure_build_value: off.STRUCTURE_BUILD_VALUE_OFFSET,
  structure_charge_intent: off.STRUCTURE_CHARGE_INTENT_OFFSET,
  attention_field: off.ATTENTION_FIELD_OFFSET,
  hive_energy_pool: off.HIVE_ENERGY_POOL_OFFSET,
  glyph_header: off.GLYPH_HEADER_OFFSET,
  glyph_payload: off.GLYPH_PAYLOAD_OFFSET,
  glyph_scratch_header: off.GLYPH_SCRATCH_HEADER_OFFSET,
  glyph_scratch_payload: off.GLYPH_SCRATCH_PAYLOAD_OFFSET,
  hormones: off.HORMONE_OFFSET,
  secretion_stats: off.SECRETION_STATS_OFFSET,
  lineage: off.LINEAGE_OFFSET,
  mailbox: off.MAILBOX_OFFSET,
  ledger_head: off.LEDGER_HEAD_OFFSET,
  ledger_data: off.LEDGER_DATA_OFFSET,
};

for (const [k, v] of Object.entries(bounds)) {
  console.log(`${k}: ${v} (+ 8 buffer) -> expected Rust offset_of: ${v + 8}`);
}

// Calculate the rust padding bytes
const expectedSizeForPad = (
  name: string,
  curEnd: number,
  nextTarget: number,
) => {
  let pad = nextTarget - curEnd;
  console.log(`_pad_${name}: [u8; ${pad}] // align to ${nextTarget + 8}`);
};

let bytesPerAtom = {
  bonds: 4 * 4,
  stiffness: 4 * 4,
  roles: 1,
  bond_distances: 4,
  damping: 1,
  causality: 1,
  physics_xs: 2,
};
console.log("\n");

// from 110,024,584
let end_spatial = bounds.spatial_grid + (140 * 80 * 128); // 32 * i32
expectedSizeForPad("roles", end_spatial, bounds.roles);

let end_roles = bounds.roles + 500000;
expectedSizeForPad("structure_grid", end_roles, bounds.structure_grid);

let end_structure = bounds.structure_grid + (140 * 80 * 4);
expectedSizeForPad("signal_grid", end_structure, bounds.signal_grid);

let end_signal = bounds.signal_grid + (140 * 80 * 4);
expectedSizeForPad("memory_grid", end_signal, bounds.memory_grid);

let end_memory = bounds.memory_grid + (140 * 80 * 8);
expectedSizeForPad("ascension", end_memory, bounds.ascension_stats);

// _pad_damping
// Note bond_distances in off is after ascension stats theoretically, wait, no, bounds says BOND_DISTANCES_OFFSET = 117137384.
// Ascension ends at 112137384 + (250000 * 4) = 113,137,384? Wait, memory.rs gives [i32; 250_000] for ascension... Wait, memory.rs has 250000 not 500000 for ascension? Oh, memory_grid is earlier.
// Wait, bounds.ascension_stats + 250_000 * 4 = 112137384 + 1000000 = 113137384. But bond_distances is 117137384! That means there's a 4M pad missing or the array size scales with atoms?
// Memory.rs: pub ascension_stats: [i32; 250_000] -> this was meant to be MAX_ATOMS * i32 perhaps?! 500k atoms * 4 = 2,000,000 bytes ... wait, old was 250000 * 4 = 1,000,000. For 100k, that is 10 bytes per atom? Let's check sizes... Wait, I should just match what I did in the offset calculator earlier!
// Let me look at OFFSETS.js.
