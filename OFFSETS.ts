// OMEGA-64 | OFFSETS.ts | Era 68: Absolute Coherence
// Unified Memory Lattice Constants - Relocated for WASM Safety

export const MAX_ATOMS = 100000;
export const SCALE = 1000;
export const GRID_W = 140;
export const GRID_H = 80;
export const GRID_CELLS = GRID_W * GRID_H;
const U64_BYTES = 8;
const I32_BYTES = 4;
const I16_BYTES = 2;
const F32_BYTES = 4;

// Shifted by 8MB to avoid WASM runtime heap overlap with lattice regions.
export const SAFETY_BUFFER = 8000000;

// Synchronization & Coordination (In the safety buffer)
export const SYNC_STATE_OFFSET = SAFETY_BUFFER - 4;
export const TICK_COUNTER_OFFSET = SAFETY_BUFFER - 8;

export const IDS_OFFSET = SAFETY_BUFFER + 0;
export const XS_OFFSET = SAFETY_BUFFER + 800000;
export const YS_OFFSET = SAFETY_BUFFER + 1000000;
export const ENERGY_OFFSET = SAFETY_BUFFER + 1200000;
export const RESONANCE_OFFSET = SAFETY_BUFFER + 1600000;
export const PHASE_OFFSET = SAFETY_BUFFER + 2000000;
export const LOGIC_OFFSET = SAFETY_BUFFER + 2400000;
export const BONDS_OFFSET = SAFETY_BUFFER + 3200000;
export const STIFFNESS_OFFSET = SAFETY_BUFFER + 4800000;
export const INSTRUCTIONS_OFFSET = SAFETY_BUFFER + 6400000;
export const CONTEXT_OFFSET = SAFETY_BUFFER + 12800000;
export const EVOLUTION_OFFSET = SAFETY_BUFFER + 19200000; // Shifted by 3.2MB
export const INTENT_OFFSET = EVOLUTION_OFFSET;
export const SPAWN_REQUESTS_OFFSET = SAFETY_BUFFER + 19600000;
export const MEIOSIS_OFFSET = SAFETY_BUFFER + 20800000;
export const BOND_REQUESTS_OFFSET = SAFETY_BUFFER + 22000000;
export const SPATIAL_GRID_OFFSET = SAFETY_BUFFER + 23200000;
export const ROLES_OFFSET = SAFETY_BUFFER + 33200000;
export const STRUCTURE_GRID_OFFSET = SAFETY_BUFFER + 34200000;
export const SIGNAL_GRID_OFFSET = SAFETY_BUFFER + 35200000;
export const MEMORY_GRID_OFFSET = SAFETY_BUFFER + 36200000;
export const ASCENSION_STATS_OFFSET = SAFETY_BUFFER + 37200000;
export const BOND_DISTANCES_OFFSET = SAFETY_BUFFER + 38200000;
export const DAMPING_OFFSET = SAFETY_BUFFER + 39200000;
export const HIVE_MEMORY_OFFSET = SAFETY_BUFFER + 40200000;
export const HIVE_BALANCE_OFFSET = SAFETY_BUFFER + 40201024;
export const QUORUM_OFFSET = SAFETY_BUFFER + 40300000;
export const COHERENCE_OFFSET = SAFETY_BUFFER + 40300100;
export const NEURAL_COHERENCE_OFFSET = SAFETY_BUFFER + 40300104;
export const PHYSICS_READ_XS_OFFSET = SAFETY_BUFFER + 40400000;
export const PHYSICS_READ_YS_OFFSET = SAFETY_BUFFER + 40600000;
export const PHYSICS_READ_ENERGY_OFFSET = SAFETY_BUFFER + 40800000;
export const PHYSICS_READ_RESONANCE_OFFSET = SAFETY_BUFFER + 41200000;
export const ENERGY_DELTA_OFFSET = SAFETY_BUFFER + 41600000;
export const RESONANCE_DELTA_OFFSET = SAFETY_BUFFER + 42000000;
export const STRUCTURE_BUILD_OWNER_OFFSET = SAFETY_BUFFER + 42400000;
export const STRUCTURE_BUILD_VALUE_OFFSET = SAFETY_BUFFER + 42444800;
export const STRUCTURE_CHARGE_INTENT_OFFSET = SAFETY_BUFFER + 42489600;
export const ATTENTION_FIELD_OFFSET = SAFETY_BUFFER + 42534400;
export const HIVE_ENERGY_POOL_OFFSET = SAFETY_BUFFER + 42579200;
export const GLYPH_HEADER_OFFSET = SAFETY_BUFFER + 42580224;
export const GLYPH_PAYLOAD_OFFSET = SAFETY_BUFFER + 42625024;
export const GLYPH_SCRATCH_HEADER_OFFSET = SAFETY_BUFFER + 42714624;
export const GLYPH_SCRATCH_PAYLOAD_OFFSET = SAFETY_BUFFER + 42759424;
export const HORMONE_OFFSET = SAFETY_BUFFER + 42849024;

type MemoryLayoutRegion = {
  name: string;
  offset: number;
  size: number;
  align: number;
};

export type MemoryLayoutValidationResult = {
  ok: boolean;
  errors: string[];
  regions: MemoryLayoutRegion[];
  latticeEnd: number;
  wasmBytes: number;
};

const region = (
  name: string,
  offset: number,
  size: number,
  align: number,
): MemoryLayoutRegion => ({ name, offset, size, align });

export const MEMORY_LAYOUT_REGIONS: MemoryLayoutRegion[] = [
  region("TICK_COUNTER", TICK_COUNTER_OFFSET, I32_BYTES, I32_BYTES),
  region("SYNC_STATE", SYNC_STATE_OFFSET, I32_BYTES, I32_BYTES),
  region("IDS", IDS_OFFSET, MAX_ATOMS * U64_BYTES, U64_BYTES),
  region("XS", XS_OFFSET, MAX_ATOMS * I16_BYTES, I16_BYTES),
  region("YS", YS_OFFSET, MAX_ATOMS * I16_BYTES, I16_BYTES),
  region("ENERGY", ENERGY_OFFSET, MAX_ATOMS * I32_BYTES, I32_BYTES),
  region("RESONANCE", RESONANCE_OFFSET, MAX_ATOMS * I32_BYTES, I32_BYTES),
  region("PHASE", PHASE_OFFSET, MAX_ATOMS * I32_BYTES, I32_BYTES),
  region("LOGIC", LOGIC_OFFSET, MAX_ATOMS * 8, 1),
  region("BONDS", BONDS_OFFSET, MAX_ATOMS * 4 * I32_BYTES, I32_BYTES),
  region(
    "STIFFNESS",
    STIFFNESS_OFFSET,
    MAX_ATOMS * 4 * F32_BYTES,
    F32_BYTES,
  ),
  region("INSTRUCTIONS", INSTRUCTIONS_OFFSET, MAX_ATOMS * 64, 1),
  region("CONTEXT", CONTEXT_OFFSET, MAX_ATOMS * 64, I32_BYTES),
  region("EVOLUTION", EVOLUTION_OFFSET, MAX_ATOMS * I32_BYTES, I32_BYTES),
  region("SPAWN_REQUESTS", SPAWN_REQUESTS_OFFSET, 8 + (1024 * 16), 8),
  region(
    "MEIOSIS_RESERVED",
    MEIOSIS_OFFSET,
    BOND_REQUESTS_OFFSET - MEIOSIS_OFFSET,
    I32_BYTES,
  ),
  region(
    "BOND_REQUESTS",
    BOND_REQUESTS_OFFSET,
    MAX_ATOMS * 3 * I32_BYTES,
    I32_BYTES,
  ),
  region(
    "SPATIAL_GRID",
    SPATIAL_GRID_OFFSET,
    GRID_CELLS * 32 * I32_BYTES,
    I32_BYTES,
  ),
  region("ROLES", ROLES_OFFSET, MAX_ATOMS, 1),
  region(
    "STRUCTURE_GRID",
    STRUCTURE_GRID_OFFSET,
    GRID_CELLS * I32_BYTES,
    I32_BYTES,
  ),
  region("SIGNAL_GRID", SIGNAL_GRID_OFFSET, GRID_CELLS * I32_BYTES, I32_BYTES),
  region("MEMORY_GRID", MEMORY_GRID_OFFSET, GRID_CELLS * 8, 1),
  region(
    "ASCENSION_STATS_RESERVED",
    ASCENSION_STATS_OFFSET,
    BOND_DISTANCES_OFFSET - ASCENSION_STATS_OFFSET,
    I32_BYTES,
  ),
  region("BOND_DISTANCES", BOND_DISTANCES_OFFSET, MAX_ATOMS * 4, 1),
  region("DAMPING", DAMPING_OFFSET, MAX_ATOMS, 1),
  region("HIVE_MEMORY", HIVE_MEMORY_OFFSET, 1024, 1),
  region("HIVE_BALANCE", HIVE_BALANCE_OFFSET, I32_BYTES, I32_BYTES),
  // Canonical host window (legacy AssemblyScript may still treat quorum as wider scratch).
  region(
    "QUORUM",
    QUORUM_OFFSET,
    COHERENCE_OFFSET - QUORUM_OFFSET,
    I32_BYTES,
  ),
  region("COHERENCE", COHERENCE_OFFSET, I32_BYTES, I32_BYTES),
  region("NEURAL_COHERENCE", NEURAL_COHERENCE_OFFSET, I32_BYTES, I32_BYTES),
  region(
    "PHYSICS_READ_XS",
    PHYSICS_READ_XS_OFFSET,
    MAX_ATOMS * I16_BYTES,
    I16_BYTES,
  ),
  region(
    "PHYSICS_READ_YS",
    PHYSICS_READ_YS_OFFSET,
    MAX_ATOMS * I16_BYTES,
    I16_BYTES,
  ),
  region(
    "PHYSICS_READ_ENERGY",
    PHYSICS_READ_ENERGY_OFFSET,
    MAX_ATOMS * I32_BYTES,
    I32_BYTES,
  ),
  region(
    "PHYSICS_READ_RESONANCE",
    PHYSICS_READ_RESONANCE_OFFSET,
    MAX_ATOMS * I32_BYTES,
    I32_BYTES,
  ),
  region("ENERGY_DELTA", ENERGY_DELTA_OFFSET, MAX_ATOMS * I32_BYTES, I32_BYTES),
  region(
    "RESONANCE_DELTA",
    RESONANCE_DELTA_OFFSET,
    MAX_ATOMS * I32_BYTES,
    I32_BYTES,
  ),
  region(
    "STRUCTURE_BUILD_OWNER",
    STRUCTURE_BUILD_OWNER_OFFSET,
    GRID_CELLS * I32_BYTES,
    I32_BYTES,
  ),
  region(
    "STRUCTURE_BUILD_VALUE",
    STRUCTURE_BUILD_VALUE_OFFSET,
    GRID_CELLS * I32_BYTES,
    I32_BYTES,
  ),
  region(
    "STRUCTURE_CHARGE_INTENT",
    STRUCTURE_CHARGE_INTENT_OFFSET,
    GRID_CELLS * I32_BYTES,
    I32_BYTES,
  ),
  region(
    "ATTENTION_FIELD",
    ATTENTION_FIELD_OFFSET,
    GRID_CELLS * F32_BYTES,
    F32_BYTES,
  ),
  region(
    "HIVE_ENERGY_POOL",
    HIVE_ENERGY_POOL_OFFSET,
    256 * I32_BYTES,
    I32_BYTES,
  ),
  region(
    "GLYPH_HEADER",
    GLYPH_HEADER_OFFSET,
    GRID_CELLS * I32_BYTES,
    I32_BYTES,
  ),
  region("GLYPH_PAYLOAD", GLYPH_PAYLOAD_OFFSET, GRID_CELLS * 8, 1),
  region(
    "GLYPH_SCRATCH_HEADER",
    GLYPH_SCRATCH_HEADER_OFFSET,
    GRID_CELLS * I32_BYTES,
    I32_BYTES,
  ),
  region(
    "GLYPH_SCRATCH_PAYLOAD",
    GLYPH_SCRATCH_PAYLOAD_OFFSET,
    GRID_CELLS * 8,
    1,
  ),
  region(
    "HORMONES",
    HORMONE_OFFSET,
    12, // 6 hormones * 2 bytes (Uint16)
    2,
  ),
];

// WASM memory layout canon
export const WASM_PAGE_BYTES = 64 * 1024;
export const LATTICE_MEMORY_END = HORMONE_OFFSET + 12;
export const MIN_WASM_MEMORY_PAGES = Math.ceil(
  LATTICE_MEMORY_END / WASM_PAGE_BYTES,
);
export const WASM_MEMORY_PAGES = 1024;
export const WASM_MEMORY_BYTES = WASM_MEMORY_PAGES * WASM_PAGE_BYTES;

export const validateMemoryLayout = (
  wasmBytes: number = WASM_MEMORY_BYTES,
): MemoryLayoutValidationResult => {
  const errors: string[] = [];
  const sorted = [...MEMORY_LAYOUT_REGIONS].sort((a, b) => a.offset - b.offset);

  for (const item of sorted) {
    if (!Number.isFinite(item.offset) || !Number.isFinite(item.size)) {
      errors.push(`[${item.name}] offset/size must be finite numbers`);
      continue;
    }
    if (item.size <= 0) {
      errors.push(`[${item.name}] size must be > 0, got ${item.size}`);
    }
    if (item.align <= 0) {
      errors.push(`[${item.name}] align must be > 0, got ${item.align}`);
    } else if (item.offset % item.align !== 0) {
      errors.push(
        `[${item.name}] misaligned offset=${item.offset} align=${item.align}`,
      );
    }
    const end = item.offset + item.size;
    if (end > wasmBytes) {
      errors.push(
        `[${item.name}] out of wasm bounds: end=${end} > wasmBytes=${wasmBytes}`,
      );
    }
  }

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const next = sorted[i];
    const prevEnd = prev.offset + prev.size;
    if (prevEnd > next.offset) {
      errors.push(
        `[${prev.name}] overlaps [${next.name}] (${prevEnd} > ${next.offset})`,
      );
    }
  }

  const maxRegionEnd = sorted.reduce(
    (max, item) => Math.max(max, item.offset + item.size),
    0,
  );
  if (maxRegionEnd > LATTICE_MEMORY_END) {
    errors.push(
      `[LATTICE_MEMORY_END] too small: ${LATTICE_MEMORY_END} < required=${maxRegionEnd}`,
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    regions: sorted,
    latticeEnd: LATTICE_MEMORY_END,
    wasmBytes,
  };
};

export const MAX_ASCENSIONS_PER_TICK = 64;
