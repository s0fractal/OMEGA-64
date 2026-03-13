// OMEGA-64 | Isomorphic Topological Generator | Era 69
// This script generates the symmetric physical constants for both Deno and Rust layers.

const SYSTEM_CONSTANTS: Record<string, [number, string]> = {
  MAX_ATOMS:           [500_000,   "usize"],
  SAFETY_BUFFER:       [8_000_000, "usize"],
  GRID_W:              [140,       "i32"],
  GRID_H:              [80,        "i32"],
  GRID_CELLS:          [140 * 80,  "usize"],
  SPATIAL_CELL_SIZE:   [10,        "i32"],
  WORLD_MAX_X:         [(140 * 10) - 1, "i32"],
  WORLD_MAX_Y:         [(80 * 10) - 1, "i32"],
  SCALE:               [1000,      "i32"],
  CELL_CAPACITY:       [32,        "usize"],
  MAX_PC:              [64,        "u8"],
  MAX_EXECUTION_STEPS: [64,        "usize"],
  ATOM_LOGIC_SIZE:     [64,        "usize"],
  MAX_LEDGER_EVENTS:   [65_536,    "usize"],
  MAX_EGRESS_EVENTS:   [8192,      "usize"],
  WASM_PAGE_BYTES:     [64 * 1024, "usize"],
  WASM_MEMORY_PAGES:   [7630,      "usize"],
  HIVE_MEMORY_SIZE:    [1024,      "usize"],
  HIVE_ENERGY_POOL_SIZE: [256,     "usize"],
  MAX_HORMONES:        [8,         "usize"],
  SECRETION_STATS_SIZE:[12,        "usize"],
  MAX_SPAWN_REQUESTS:  [1024,      "usize"],
  MAX_MEIOSIS_EVENTS:  [75000,     "usize"],
  MAX_ASCENSION_STATS: [62500,     "usize"],
  MAX_ASCENSION_STATS_RESERVED: [1250000, "usize"],
  ATOM_CONTEXT_SIZE:   [16,        "usize"],
  ATOM_GENOME_SIZE:    [8,         "usize"],
  ATOM_INSTRUCTION_SIZE: [64,      "usize"],
  RESOURCE_MAX:        [2_000_000_000, "i32"],
  MAX_GLYPH_AMP:       [8388607,   "i32"],
  MIN_GLYPH_AMP:       [-8388608,  "i32"],
  SPAWN_MAX:           [1024,      "i32"],
  SPAWN_SLOT:          [24,        "i32"],
};

const VM_OPCODES: Record<string, number> = {
  OP_NOP: 0x00,
  OP_SET: 0x01,
  OP_GET: 0x02,
  OP_PUT: 0x03,
  OP_ADD: 0x04,
  OP_SUB: 0x05,
  OP_JZ: 0x10,
  OP_JNZ: 0x11,
  OP_JMP: 0x12,
  OP_SYSCALL: 0x60,
  OP_REPLICATE: 0x80,
  OP_SIGNAL: 0x81,
  OP_BIND: 0x82,
  OP_SHARE: 0x83,
  OP_HEBB: 0x8A,
  OP_FIRE: 0x8B,
  OP_DECAY: 0x91,
  OP_PLUG: 0xA4,
  OP_TENSEGRITY: 0xA5,
  OP_COLLECTIVE: 0xA6,
  OP_BUILD: 0xA8,
  OP_SPORE_DRIVE: 0xA8,
  OP_SENSE: 0xA9, // From Rust ISA
  OP_SENSE_AS: 0xB2, // From AS legacy
  OP_SECRETE_PLASMID: 0xAA,
  OP_INCORPORATE_PLASMID: 0xAB,
  OP_RESOLVE: 0xB0,
  OP_RESONATE_KURAMOTO: 0xB1,
};

const VM_PROPS: Record<string, number> = {
  PROP_ENERGY: 0,
  PROP_RESONANCE: 1,
  PROP_X: 2,
  PROP_Y: 3,
  PROP_PHASE: 4,
  PROP_GRID_CHARGE: 7,
  PROP_QUORUM: 8,
  PROP_NEURAL_COHERENCE: 9,
  PROP_MEMORY: 10,
  PROP_CONSENSUS: 11,
};

const VM_SYS: Record<string, number> = {
  SYS_YIELD: 1,
  SYS_READ_MEM: 2,
  SYS_WRITE_MEM: 3,
  SYS_SPAWN: 4,
  SYS_BIND: 5,
  SYS_SET_ROLE: 6,
  SYS_MUTATE: 7,
  SYS_MSG: 8,
  SYS_READ_INBOX: 9,
  SYS_TRANSFER: 10,
  SYS_REPLICATE: 11,
  SYS_EMIT: 12,
  SYS_SCAN: 13,
  SYS_MOVE: 14,
  SYS_EAT: 15,
  SYS_BET: 16,
  SYS_ATTRACT: 17,
  SYS_FOLD: 18,
  SYS_SPORE_DRIVE: 20,
  SYS_SENSE_PHASE: 21,
};

const STRUCTURE_TYPES: Record<string, number> = {
  STR_VOID: 0,
  STR_WIRE: 1,
  STR_NODE: 2,
  STR_DIODE: 3,
  STR_SOURCE: 4,
  STR_SINK: 5,
  STR_CAPACITOR: 6,
  STR_INVERTER: 7,
  STR_LATCH: 8,
};
// TS_OFFSETS generation logic moved to the bottom part of the file.
const U64_BYTES = 8;
const I32_BYTES = 4;
const I16_BYTES = 2;
const F32_BYTES = 4;

export type MemoryLayoutRegion = { name: string; offset?: number; size: number; align: number; };

export const MEMORY_LAYOUT_REGIONS: MemoryLayoutRegion[] = [
  { name: "TICK_COUNTER", size: I32_BYTES, align: I32_BYTES },
  { name: "SYNC_STATE", size: I32_BYTES, align: I32_BYTES },
  { name: "IDS", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * U64_BYTES, align: U64_BYTES },
  { name: "XS", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * I16_BYTES, align: I16_BYTES },
  { name: "YS", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * I16_BYTES, align: I16_BYTES },
  { name: "ENERGY", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * I32_BYTES, align: I32_BYTES },
  { name: "RESONANCE", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * I32_BYTES, align: I32_BYTES },
  { name: "PHASE", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * I32_BYTES, align: I32_BYTES },
  { name: "LOGIC", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * SYSTEM_CONSTANTS.ATOM_GENOME_SIZE[0], align: 1 },
  { name: "BONDS", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * 4 * I32_BYTES, align: I32_BYTES },
  { name: "STIFFNESS", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * 4 * F32_BYTES, align: F32_BYTES },
  { name: "INSTRUCTIONS", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * SYSTEM_CONSTANTS.ATOM_INSTRUCTION_SIZE[0], align: 1 },
  { name: "CONTEXT", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * SYSTEM_CONSTANTS.ATOM_CONTEXT_SIZE[0] * I32_BYTES, align: I32_BYTES },
  { name: "EVOLUTION", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * I32_BYTES, align: I32_BYTES },
  // INTENT_OFFSET maps to EVOLUTION_OFFSET in ts variables for backward compat, not a separate region physically
  { name: "SPAWN_REQUESTS", size: 8 + (SYSTEM_CONSTANTS.MAX_SPAWN_REQUESTS[0] * 24), align: 8 },
  { name: "MEIOSIS_RESERVED", size: SYSTEM_CONSTANTS.MAX_MEIOSIS_EVENTS[0] * 80, align: I32_BYTES },
  { name: "BOND_REQUESTS", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * 3 * I32_BYTES, align: I32_BYTES },
  { name: "SPATIAL_GRID", size: SYSTEM_CONSTANTS.GRID_CELLS[0] * 32 * I32_BYTES, align: I32_BYTES },
  { name: "ROLES", size: SYSTEM_CONSTANTS.MAX_ATOMS[0], align: 1 },
  { name: "STRUCTURE_GRID", size: SYSTEM_CONSTANTS.GRID_CELLS[0] * I32_BYTES, align: I32_BYTES },
  { name: "SIGNAL_GRID", size: SYSTEM_CONSTANTS.GRID_CELLS[0] * I32_BYTES, align: I32_BYTES },
  { name: "MEMORY_GRID", size: SYSTEM_CONSTANTS.GRID_CELLS[0] * 8, align: 1 },
  { name: "ASCENSION_STATS_RESERVED", size: SYSTEM_CONSTANTS.MAX_ASCENSION_STATS_RESERVED[0] * 4, align: I32_BYTES },
  { name: "BOND_DISTANCES", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * 4, align: 1 },
  { name: "SYNAPTIC_WEIGHTS", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * 4, align: 1 },
  { name: "DAMPING", size: SYSTEM_CONSTANTS.MAX_ATOMS[0], align: 1 },
  { name: "CAUSALITY", size: SYSTEM_CONSTANTS.MAX_ATOMS[0], align: 1 },
  { name: "HIVE_MEMORY", size: SYSTEM_CONSTANTS.HIVE_MEMORY_SIZE[0], align: 1 },
  { name: "HIVE_BALANCE", size: I32_BYTES, align: I32_BYTES },
  { name: "QUORUM", size: SYSTEM_CONSTANTS.GRID_CELLS[0] * 8 * I32_BYTES, align: I32_BYTES },
  { name: "COHERENCE", size: I32_BYTES, align: I32_BYTES },
  { name: "NEURAL_COHERENCE", size: I32_BYTES, align: I32_BYTES },
  { name: "PHYSICS_READ_XS", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * I16_BYTES, align: I16_BYTES },
  { name: "PHYSICS_READ_YS", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * I16_BYTES, align: I16_BYTES },
  { name: "PHYSICS_READ_ENERGY", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * I32_BYTES, align: I32_BYTES },
  { name: "PHYSICS_READ_RESONANCE", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * I32_BYTES, align: I32_BYTES },
  { name: "ENERGY_DELTA", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * I32_BYTES, align: I32_BYTES },
  { name: "RESONANCE_DELTA", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * I32_BYTES, align: I32_BYTES },
  { name: "STRUCTURE_BUILD_OWNER", size: SYSTEM_CONSTANTS.GRID_CELLS[0] * I32_BYTES, align: I32_BYTES },
  { name: "STRUCTURE_BUILD_VALUE", size: SYSTEM_CONSTANTS.GRID_CELLS[0] * I32_BYTES, align: I32_BYTES },
  { name: "STRUCTURE_CHARGE_INTENT", size: SYSTEM_CONSTANTS.GRID_CELLS[0] * I32_BYTES, align: I32_BYTES },
  { name: "ATTENTION_FIELD", size: SYSTEM_CONSTANTS.GRID_CELLS[0] * F32_BYTES, align: F32_BYTES },
  { name: "HIVE_ENERGY_POOL", size: SYSTEM_CONSTANTS.HIVE_ENERGY_POOL_SIZE[0] * I32_BYTES, align: I32_BYTES },
  { name: "GLYPH_HEADER", size: SYSTEM_CONSTANTS.GRID_CELLS[0] * I32_BYTES, align: I32_BYTES },
  { name: "GLYPH_PAYLOAD", size: SYSTEM_CONSTANTS.GRID_CELLS[0] * 8, align: 1 },
  { name: "GLYPH_SCRATCH_HEADER", size: SYSTEM_CONSTANTS.GRID_CELLS[0] * I32_BYTES, align: I32_BYTES },
  { name: "GLYPH_SCRATCH_PAYLOAD", size: SYSTEM_CONSTANTS.GRID_CELLS[0] * 8, align: 1 },
  { name: "HORMONES", size: SYSTEM_CONSTANTS.MAX_HORMONES[0] * 2, align: 2 },
  { name: "SECRETION_STATS", size: SYSTEM_CONSTANTS.SECRETION_STATS_SIZE[0] * 4, align: 4 },
  { name: "LINEAGE", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * U64_BYTES, align: U64_BYTES },
  { name: "MAILBOX", size: SYSTEM_CONSTANTS.MAX_ATOMS[0] * 8, align: I32_BYTES },
  { name: "LEDGER_HEAD", size: 4, align: 4 },
  { name: "LEDGER_DATA", size: SYSTEM_CONSTANTS.MAX_LEDGER_EVENTS[0] * 16, align: 4 },
  { name: "EGRESS_HEAD", size: 4, align: 4 },
  { name: "EGRESS_DATA", size: SYSTEM_CONSTANTS.MAX_EGRESS_EVENTS[0] * 128, align: 4 },
];

const TS_CONSTANTS_LINES: string[] = [];
const RS_CONSTANTS_LINES: string[] = [];
const AS_CONSTANTS_LINES: string[] = [];

let currentOffset = SYSTEM_CONSTANTS.SAFETY_BUFFER[0] - 8;

for (const region of MEMORY_LAYOUT_REGIONS) {
  // align
  const rem = currentOffset % region.align;
  if (rem !== 0) {
    currentOffset += (region.align - rem);
  }
  
  region.offset = currentOffset;
  const name = region.name + "_OFFSET";
  
  TS_CONSTANTS_LINES.push("export const " + name + " = " + currentOffset + ";");
  RS_CONSTANTS_LINES.push("pub const " + name + ": usize = " + currentOffset + ";");
  AS_CONSTANTS_LINES.push("export const " + name + ": usize = " + currentOffset + ";");

  TS_CONSTANTS_LINES.push("export const " + region.name + "_OFF = " + currentOffset + ";");
  RS_CONSTANTS_LINES.push("pub const " + region.name + "_OFF: usize = " + currentOffset + ";");
  AS_CONSTANTS_LINES.push("export const " + region.name + "_OFF: usize = " + currentOffset + ";");

  // backwards compatibility items
  if (region.name === "EVOLUTION") {
    TS_CONSTANTS_LINES.push("export const INTENT_OFFSET = " + currentOffset + ";");
    RS_CONSTANTS_LINES.push("pub const INTENT_OFFSET: usize = " + currentOffset + ";");
    AS_CONSTANTS_LINES.push("export const INTENT_OFFSET: usize = " + currentOffset + ";");
  } else if (region.name === "INSTRUCTIONS") {
    TS_CONSTANTS_LINES.push("export const GENOMES_OFFSET = " + currentOffset + ";");
    RS_CONSTANTS_LINES.push("pub const GENOMES_OFFSET: usize = " + currentOffset + ";");
    AS_CONSTANTS_LINES.push("export const GENOMES_OFFSET: usize = " + currentOffset + ";");
  } else if (region.name === "SPAWN_REQUESTS") {
    TS_CONSTANTS_LINES.push("export const SPAWN_GRID_OFF = " + currentOffset + ";");
    RS_CONSTANTS_LINES.push("pub const SPAWN_GRID_OFF: usize = " + currentOffset + ";");
    AS_CONSTANTS_LINES.push("export const SPAWN_GRID_OFF: usize = " + currentOffset + ";");
    TS_CONSTANTS_LINES.push("export const SPAWN_HEAD_OFF = " + currentOffset + ";");
    RS_CONSTANTS_LINES.push("pub const SPAWN_HEAD_OFF: usize = " + currentOffset + ";");
    AS_CONSTANTS_LINES.push("export const SPAWN_HEAD_OFF: usize = " + currentOffset + ";");
    TS_CONSTANTS_LINES.push("export const SPAWN_DATA_OFF = " + (currentOffset + 8) + ";");
    RS_CONSTANTS_LINES.push("pub const SPAWN_DATA_OFF: usize = " + (currentOffset + 8) + ";");
    AS_CONSTANTS_LINES.push("export const SPAWN_DATA_OFF: usize = " + (currentOffset + 8) + ";");
  } else if (region.name === "MEIOSIS_RESERVED") {
    TS_CONSTANTS_LINES.push("export const METABOLISM_SCRATCH_OFF = " + currentOffset + ";");
    RS_CONSTANTS_LINES.push("pub const METABOLISM_SCRATCH_OFF: usize = " + currentOffset + ";");
    AS_CONSTANTS_LINES.push("export const METABOLISM_SCRATCH_OFF: usize = " + currentOffset + ";");
    TS_CONSTANTS_LINES.push("export const MEIOSIS_OFFSET = " + currentOffset + ";");
    RS_CONSTANTS_LINES.push("pub const MEIOSIS_OFFSET: usize = " + currentOffset + ";");
    AS_CONSTANTS_LINES.push("export const MEIOSIS_OFFSET: usize = " + currentOffset + ";");
  } else if (region.name === "BOND_DISTANCES") {
    TS_CONSTANTS_LINES.push("export const BOND_DIST_OFF = " + currentOffset + ";");
    RS_CONSTANTS_LINES.push("pub const BOND_DIST_OFF: usize = " + currentOffset + ";");
    AS_CONSTANTS_LINES.push("export const BOND_DIST_OFF: usize = " + currentOffset + ";");
  } else if (region.name === "ASCENSION_STATS_RESERVED") {
    TS_CONSTANTS_LINES.push("export const ASCENSION_STATS_OFFSET = " + currentOffset + ";");
    RS_CONSTANTS_LINES.push("pub const ASCENSION_STATS_OFFSET: usize = " + currentOffset + ";");
    AS_CONSTANTS_LINES.push("export const ASCENSION_STATS_OFFSET: usize = " + currentOffset + ";");
    TS_CONSTANTS_LINES.push("export const ASCENSION_STATS_OFF = " + currentOffset + ";");
    RS_CONSTANTS_LINES.push("pub const ASCENSION_STATS_OFF: usize = " + currentOffset + ";");
    AS_CONSTANTS_LINES.push("export const ASCENSION_STATS_OFF: usize = " + currentOffset + ";");
  } else if (region.name === "HORMONES") {
    TS_CONSTANTS_LINES.push("export const HORMONE_OFFSET = " + currentOffset + ";");
    RS_CONSTANTS_LINES.push("pub const HORMONE_OFFSET: usize = " + currentOffset + ";");
    AS_CONSTANTS_LINES.push("export const HORMONE_OFFSET: usize = " + currentOffset + ";");
    TS_CONSTANTS_LINES.push("export const HORMONE_OFF = " + currentOffset + ";");
    RS_CONSTANTS_LINES.push("pub const HORMONE_OFF: usize = " + currentOffset + ";");
    AS_CONSTANTS_LINES.push("export const HORMONE_OFF: usize = " + currentOffset + ";");
  }

  currentOffset += region.size;
}

export const LATTICE_MEMORY_END = currentOffset;
export const MIN_WASM_MEMORY_PAGES = Math.max(2600, Math.ceil(LATTICE_MEMORY_END / (64 * 1024)));
export const WASM_MEMORY_BYTES = MIN_WASM_MEMORY_PAGES * (64 * 1024);

export type MemoryLayoutValidationResult = { ok: boolean; errors: string[]; regions: MemoryLayoutRegion[]; latticeEnd: number; wasmBytes: number; };

export const validateMemoryLayout = (wasmBytes: number = WASM_MEMORY_BYTES): MemoryLayoutValidationResult => {
  const errors: string[] = [];
  const sorted = [...MEMORY_LAYOUT_REGIONS].sort((a, b) => (a.offset || 0) - (b.offset || 0));

  for (const item of sorted) {
    if (item.offset === undefined || !Number.isFinite(item.offset) || !Number.isFinite(item.size)) {
      errors.push("[" + item.name + "] offset/size must be finite numbers");
      continue;
    }
    if (item.size <= 0) errors.push("[" + item.name + "] size must be > 0, got " + item.size);
    if (item.align <= 0) {
      errors.push("[" + item.name + "] align must be > 0, got " + item.align);
    } else if (item.offset % item.align !== 0) {
      errors.push("[" + item.name + "] misaligned offset=" + item.offset + " align=" + item.align);
    }
    const end = item.offset + item.size;
    if (end > wasmBytes) errors.push("[" + item.name + "] out of wasm bounds: end=" + end + " > wasmBytes=" + wasmBytes);
  }

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]; const next = sorted[i];
    const prevEnd = (prev.offset || 0) + prev.size;
    if (prevEnd > (next.offset || 0)) errors.push("[" + prev.name + "] overlaps [" + next.name + "] (" + prevEnd + " > " + next.offset + ")");
  }

  const maxRegionEnd = sorted.reduce((max, item) => Math.max(max, (item.offset || 0) + item.size), 0);
  if (maxRegionEnd > LATTICE_MEMORY_END) errors.push("[LATTICE_MEMORY_END] too small: " + LATTICE_MEMORY_END + " < required=" + maxRegionEnd);

  return { ok: errors.length === 0, errors, regions: sorted, latticeEnd: LATTICE_MEMORY_END, wasmBytes };
};

export const MAX_ASCENSIONS_PER_TICK = 64;

// Generate TypeScript Offsets (Imperative Shell)
const TS_OFFSETS = [
  "// AUTOGENERATED - DO NOT EDIT DIRECTLY (See generate.ts)",
  "// OMEGA-64 | OFFSETS.ts | Era 69: Absolute Coherence",
  "// Unified Memory Lattice Constants - Relocated for WASM Safety",
  ...Object.entries(SYSTEM_CONSTANTS).map(([name, [value, _]]) => "export const " + name + " = " + value + ";"),
  ...Object.entries(VM_OPCODES).map(([n,v]) => "export const " + n + " = " + v + ";"),
  ...Object.entries(VM_PROPS).map(([n,v]) => "export const " + n + " = " + v + ";"),
  ...Object.entries(VM_SYS).map(([n,v]) => "export const " + n + " = " + v + ";"),
  ...Object.entries(STRUCTURE_TYPES).map(([n,v]) => "export const " + n + " = " + v + ";"),
  "const U64_BYTES = 8;",
  "const I32_BYTES = 4;",
  "const I16_BYTES = 2;",
  "const F32_BYTES = 4;",
  ...TS_CONSTANTS_LINES,
  "export type MemoryLayoutRegion = { name: string; offset?: number; size: number; align: number; };",
  "export const LATTICE_MEMORY_END = " + LATTICE_MEMORY_END + ";",
  "export const MIN_WASM_MEMORY_PAGES = " + MIN_WASM_MEMORY_PAGES + ";",
  "export const WASM_MEMORY_BYTES = " + WASM_MEMORY_BYTES + ";",
  "export type MemoryLayoutValidationResult = { ok: boolean; errors: string[]; regions: MemoryLayoutRegion[]; latticeEnd: number; wasmBytes: number; };",
  "export const MEMORY_LAYOUT_REGIONS: MemoryLayoutRegion[] = " + JSON.stringify(MEMORY_LAYOUT_REGIONS, null, 2) + ";",
  "export const validateMemoryLayout = " + validateMemoryLayout.toString() + ";",
  "export const MAX_ASCENSIONS_PER_TICK = 64;"
].join("\n");

const rsLayoutVariables = [
  "pub const U64_BYTES: usize = 8;",
  "pub const I32_BYTES: usize = 4;",
  "pub const I16_BYTES: usize = 2;",
  "pub const F32_BYTES: usize = 4;",
  ...RS_CONSTANTS_LINES,
  "pub const LATTICE_MEMORY_END: usize = " + LATTICE_MEMORY_END + ";"
].join("\n");


// // Generate Rust Constants (Functional Core)
const RS_CONSTANTS = [
  "// AUTOGENERATED - DO NOT EDIT DIRECTLY (See generate.ts)",
  "//! Defines system-wide physical constants and enumerations for the OMEGA-64 Sigma Core.",
  "//! These values are isomorphically synchronized with the TypeScript layer.",
  ...Object.entries(SYSTEM_CONSTANTS).map(([name, [value, type]]) => "pub const " + name + ": " + type + " = " + value + ";"),
  ...Object.entries(VM_OPCODES).map(([n,v]) => "pub const " + n + ": u8 = " + v + ";"),
  ...Object.entries(VM_PROPS).map(([n,v]) => "pub const " + n + ": u8 = " + v + ";"),
  "// Sycall Indices",
  ...Object.entries(VM_SYS).map(([n,v]) => "pub const " + n + ": i32 = " + v + ";"),
  "// Structure Types",
  ...Object.entries(STRUCTURE_TYPES).map(([n,v]) => "pub const " + n + ": i32 = " + v + ";"),
  rsLayoutVariables,
  "/// Strongly typed roles for LambdaVM Atoms",
  "#[repr(u8)]",
  "#[derive(Debug, Clone, Copy, PartialEq, Eq)]",
  "pub enum AtomRole {",
  "    None = 0,",
  "    Guardian = 1,",
  "    Architect = 2,",
  "    Artisan = 3,",
  "    Parasite = 4,",
  "    Mitochondria = 5,",
  "    MetazoanFlag = 0x80,",
  "}",
  "impl AtomRole {",
  "    pub fn from_u8(val: u8) -> Self {",
  "        match val {",
  "            1 => Self::Guardian,",
  "            2 => Self::Architect,",
  "            3 => Self::Artisan,",
  "            4 => Self::Parasite,",
  "            5 => Self::Mitochondria,",
  "            0x80 => Self::MetazoanFlag,",
  "            _ => Self::None,",
  "        }",
  "    }",
  "}"
].join("\n");


Deno.writeTextFileSync(new URL("./OFFSETS.ts", import.meta.url), TS_OFFSETS);
Deno.writeTextFileSync(new URL("./sigma_core/src/constants.rs", import.meta.url), RS_CONSTANTS);

// Legacy mathematical functions have been migrated to the Ontology Graph.

const AS_CONSTANTS = [
  "// AUTOGENERATED - DO NOT EDIT DIRECTLY (See generate.ts)",
  "// OMEGA-64 | constants.assembly.ts | Era 69",
  "// Isomorphic WASM Constants",
  ...Object.entries(SYSTEM_CONSTANTS).map(([name, [value, type]]) => {
    const asType = (name === "MAX_ATOMS") ? "i32" : type;
    return "export const " + name + ": " + asType + " = " + value + ";";
  }),
  ...Object.entries(VM_OPCODES).map(([n,v]) => "export const " + n + ": u8 = " + v + ";"),
  ...Object.entries(VM_PROPS).map(([n,v]) => "export const " + n + ": u8 = " + v + ";"),
  ...Object.entries(VM_SYS).map(([n,v]) => "export const " + n + ": i32 = " + v + ";"),
  ...Object.entries(STRUCTURE_TYPES).map(([n,v]) => "export const " + n + ": i32 = " + v + ";"),
  ...AS_CONSTANTS_LINES
].join("\n");

Deno.writeTextFileSync(new URL("./01/assembly/constants.assembly.ts", import.meta.url), AS_CONSTANTS);
console.log("[DAG] Successfully generated Isomorphic Topology ('OFFSETS.ts', 'constants.rs', 'math.rs' and 'constants.assembly.ts')");
