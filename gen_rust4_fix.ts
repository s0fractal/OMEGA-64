import * as off from "./OFFSETS.ts";

const bounds: Record<string, number> = {
  tick_counter: 7999992,
  sync_state: 7999996,
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

const sizes: Record<string, number> = {
  tick_counter: 4,
  sync_state: 4,
  ids: 8 * 500000,
  xs: 2 * 500000,
  ys: 2 * 500000,
  energy: 4 * 500000,
  resonance: 4 * 500000,
  phase: 4 * 500000,
  logic: 8 * 500000,
  bonds: 4 * 500000 * 4,
  stiffness: 4 * 500000 * 4,
  instructions: 64 * 500000,
  context: 64 * 500000,
  evolution_reserved: 4 * 500000,
  spawn_requests: 24584,
  meiosis: 4 * 300000,
  bond_requests: 4 * 500000 * 3,
  spatial_grid: 4 * 358400,
  roles: 1 * 500000,
  structure_grid: 4 * 11200,
  signal_grid: 4 * 11200,
  memory_grid: 8 * 11200,
  ascension_stats: 4 * 250000,
  bond_distances: 1 * 500000 * 4,
  damping: 1 * 500000,
  causality: 1 * 500000,
  hive_memory: 1024,
  hive_balance: 4,
  quorum: 4 * 89600,
  coherence: 4,
  neural_coherence: 4,
  physics_read_xs: 2 * 500000,
  physics_read_ys: 2 * 500000,
  physics_read_energy: 4 * 500000,
  physics_read_resonance: 4 * 500000,
  energy_delta: 4 * 500000,
  resonance_delta: 4 * 500000,
  structure_build_owner: 4 * 11200,
  structure_build_value: 4 * 11200,
  structure_charge_intent: 4 * 11200,
  attention_field: 4 * 11200,
  hive_energy_pool: 4 * 256,
  glyph_header: 4 * 11200,
  glyph_payload: 8 * 11200,
  glyph_scratch_header: 4 * 11200,
  glyph_scratch_payload: 8 * 11200,
  hormones: 2 * 8,
  secretion_stats: 4 * 12,
  lineage: 8 * 500000,
  mailbox: 8 * 500000,
  ledger_head: 4,
  ledger_data: 16 * 65536,
};

const keys = Object.keys(bounds);

let structOut = `
    pub _pad_front: [u8; 7_999_992],
    pub tick_counter: i32,
    pub sync_state: i32,
`;

let testOut = `
    #[test]
    fn verify_memory_offsets() {
        assert_eq!(offset_of!(SigmaMatrix, tick_counter), 7_999_992, "tick_counter");
        assert_eq!(offset_of!(SigmaMatrix, sync_state), 7_999_996, "sync_state");
`;

let cur = 8000000;
for (const k of keys) {
  if (k === "tick_counter" || k === "sync_state") continue;
  let start = bounds[k];
  if (start > cur) {
    structOut += `    pub _pad_to_${k}: [u8; ${start - cur}],\n`;
  }

  if (k === "ids" || k === "lineage") {
    structOut += `    pub ${k}: [u64; ${sizes[k] / 8}],\n`;
  } else if (["xs", "ys", "physics_read_xs", "physics_read_ys"].includes(k)) {
    structOut += `    pub ${k}: [i16; ${sizes[k] / 2}],\n`;
  } else if (
    [
      "energy",
      "resonance",
      "phase",
      "bonds",
      "evolution_reserved",
      "bond_requests",
      "spatial_grid",
      "structure_grid",
      "signal_grid",
      "ascension_stats",
      "quorum",
      "physics_read_energy",
      "physics_read_resonance",
      "energy_delta",
      "resonance_delta",
      "structure_build_owner",
      "structure_build_value",
      "structure_charge_intent",
      "hive_energy_pool",
      "glyph_header",
      "glyph_scratch_header",
      "secretion_stats",
      "meiosis",
    ].includes(k)
  ) structOut += `    pub ${k}: [i32; ${sizes[k] / 4}],\n`;
  else if (["stiffness", "attention_field"].includes(k)) {
    structOut += `    pub ${k}: [f32; ${sizes[k] / 4}],\n`;
  } else if (
    ["logic", "glyph_payload", "glyph_scratch_payload", "memory_grid"].includes(
      k,
    )
  ) structOut += `    pub ${k}: [[u8; 8]; ${sizes[k] / 8}],\n`;
  else if (k === "instructions") {
    structOut += `    pub ${k}: [[u8; 64]; ${sizes[k] / 64}],\n`;
  } else if (k === "context") {
    structOut += `    pub ${k}: [[i32; 16]; ${sizes[k] / 64}],\n`;
  } else if (k === "mailbox") {
    structOut += `    pub ${k}: [[i32; 2]; ${sizes[k] / 8}],\n`;
  } else if (k === "ledger_data") {
    structOut += `    pub ${k}: [[i32; 4]; ${sizes[k] / 16}],\n`;
  } else if (k === "hormones") {
    structOut += `    pub ${k}: [u16; ${sizes[k] / 2}],\n`;
  } else if (
    ["ledger_head", "hive_balance", "coherence", "neural_coherence"].includes(k)
  ) structOut += `    pub ${k}: i32,\n`;
  else structOut += `    pub ${k}: [u8; ${sizes[k]}],\n`;

  testOut +=
    `        assert_eq!(offset_of!(SigmaMatrix, ${k}), ${start}, "${k}");\n`;

  cur = start + sizes[k];
}

testOut += `    }\n`;

import * as fs from "node:fs";

let memory_rs = fs.readFileSync("sigma_core/src/memory.rs", "utf8");

memory_rs = memory_rs.replace(
  /pub _pad_front: \[u8; [0-9_]+\],[\s\S]+?pub ledger_data: \[\[i32; 4\]; 65536\],/,
  structOut.trim(),
);

// Replace test
memory_rs = memory_rs.replace(
  /#\[test\]\s+fn verify_memory_offsets\(\)\s*\{[\s\S]+?    }\n(?=\})/m,
  testOut,
);

fs.writeFileSync("sigma_core/src/memory.rs", memory_rs);
