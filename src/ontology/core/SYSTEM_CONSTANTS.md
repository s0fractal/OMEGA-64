---
id: SYSTEM_CONSTANTS
type: constants
description: "Core physical, spatial and computational limits"
deps: []
values:
  MAX_ATOMS: 
    value: 500000
    type: usize
  LAYOUT_VERSION:
    value: 1
    type: u32
  SAFETY_BUFFER: 
    value: 8000000
    type: usize
  GRID_W: 
    value: 140
    type: i32
  GRID_H: 
    value: 80
    type: i32
  GRID_CELLS:
    expr: "GRID_W * GRID_H"
    type: usize
  SPATIAL_CELL_SIZE: 
    value: 10
    type: i32
  WORLD_MAX_X: 
    expr: "(GRID_W * SPATIAL_CELL_SIZE) - 1"
    type: i32
  WORLD_MAX_Y: 
    expr: "(GRID_H * SPATIAL_CELL_SIZE) - 1"
    type: i32
  STRUCTURE_INTENT_SPIN_LIMIT:
    value: 128
    type: i32
  PHEROMONE_COST_BASE:
    value: 10
    type: i32
  PLASMID_COST_BASE:
    value: 25
    type: i32
  ROLE_NEUTRAL:
    value: 0
    type: u8
  ROLE_PRODUCER:
    value: 1
    type: u8
  ROLE_GUARDIAN:
    value: 2
    type: u8
  ROLE_ARCHITECT:
    value: 3
    type: u8
  ROLE_PARASITE:
    value: 4
    type: u8
  STRUCTURE_INTENT_LOCK_BIT:
    value: -2147483648
    type: i32
  STRUCTURE_INTENT_OWNER_MASK:
    value: 2147483647
    type: i32

  SCALE: 
    value: 1000
    type: i32
  CELL_CAPACITY: 
    value: 32
    type: usize
  MAX_PC: 
    value: 64
    type: u8
  MAX_EXECUTION_STEPS: 
    value: 64
    type: usize
  ATOM_LOGIC_SIZE: 
    value: 64
    type: usize
  MAX_LEDGER_EVENTS: 
    value: 65536
    type: usize
  MAX_EGRESS_EVENTS: 
    value: 8192
    type: usize
  WASM_PAGE_BYTES: 
    value: 65536
    type: usize
  WASM_MEMORY_PAGES: 
    value: 7630
    type: usize
  HIVE_MEMORY_SIZE: 
    value: 1024
    type: usize
  HIVE_ENERGY_POOL_SIZE: 
    value: 256
    type: usize
  MAX_HORMONES: 
    value: 8
    type: usize
  SECRETION_STATS_SIZE: 
    value: 12
    type: usize
  MAX_SPAWN_REQUESTS: 
    value: 1024
    type: usize
  MAX_MEIOSIS_EVENTS: 
    value: 75000
    type: usize
  MAX_ASCENSION_STATS: 
    value: 62500
    type: usize
  MAX_ASCENSION_STATS_RESERVED: 
    value: 1250000
    type: usize
  ATOM_CONTEXT_SIZE: 
    value: 16
    type: usize
  ATOM_GENOME_SIZE: 
    value: 8
    type: usize
  ATOM_INSTRUCTION_SIZE: 
    value: 64
    type: usize
  RESOURCE_MAX: 
    value: 2000000000
    type: i32
  MAX_GLYPH_AMP: 
    value: 8388607
    type: i32
  MIN_GLYPH_AMP: 
    value: -8388608
    type: i32
  SPAWN_MAX: 
    value: 1024
    type: i32
  SPAWN_SLOT: 
    value: 24
    type: i32
---
