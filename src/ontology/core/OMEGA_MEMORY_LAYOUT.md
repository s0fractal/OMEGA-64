---
id: OMEGA_MEMORY_LAYOUT
type: memory_layout
description: "Isomorphic topological mapping of all generic WebAssembly shared arrays"
min_level: 1
deps: []
vars:
  - MAX_ATOMS
  - SAFETY_BUFFER
  - GRID_CELLS
base_offset: "SAFETY_BUFFER - 8"
regions:
  - name: TICK_COUNTER
    size: 4
    align: 4
  - name: SYNC_STATE
    size: 4
    align: 4
  - name: IDS
    size: "MAX_ATOMS * 8"
    align: 8
  - name: XS
    size: "MAX_ATOMS * 2"
    align: 2
  - name: YS
    size: "MAX_ATOMS * 2"
    align: 2
  - name: ENERGY
    size: "MAX_ATOMS * 4"
    align: 4
  - name: RESONANCE
    size: "MAX_ATOMS * 4"
    align: 4
  - name: PHASE
    size: "MAX_ATOMS * 4"
    align: 4
  - name: LOGIC
    size: "MAX_ATOMS * 8"
    align: 1
  - name: BONDS
    size: "MAX_ATOMS * 4 * 4"
    align: 4
  - name: STIFFNESS
    size: "MAX_ATOMS * 4 * 4"
    align: 4
  - name: INSTRUCTIONS
    size: "MAX_ATOMS * 64"
    align: 1
  - name: CONTEXT
    size: "MAX_ATOMS * 16 * 4"
    align: 4
  - name: EVOLUTION
    size: "MAX_ATOMS * 4"
    align: 4
  - name: SPAWN_REQUESTS
    size: "8 + (1024 * 24)"
    align: 8
  - name: MEIOSIS_RESERVED
    size: "75000 * 80"
    align: 4
  - name: BOND_REQUESTS
    size: "MAX_ATOMS * 3 * 4"
    align: 4
  - name: SPATIAL_GRID
    size: "GRID_CELLS * 32 * 4"
    align: 4
  - name: ROLES
    size: "MAX_ATOMS"
    align: 1
  - name: STRUCTURE_GRID
    size: "GRID_CELLS * 4"
    align: 4
  - name: SIGNAL_GRID
    size: "GRID_CELLS * 4"
    align: 4
  - name: MEMORY_GRID
    size: "GRID_CELLS * 8"
    align: 1
  - name: ASCENSION_STATS_RESERVED
    size: "1250000 * 4"
    align: 4
  - name: BOND_DISTANCES
    size: "MAX_ATOMS * 4"
    align: 1
  - name: SYNAPTIC_WEIGHTS
    size: "MAX_ATOMS * 4"
    align: 1
  - name: DAMPING
    size: "MAX_ATOMS"
    align: 1
  - name: CAUSALITY
    size: "MAX_ATOMS"
    align: 1
  - name: HIVE_MEMORY
    size: 1024
    align: 1
  - name: HIVE_BALANCE
    size: 4
    align: 4
  - name: QUORUM
    size: "GRID_CELLS * 8 * 4"
    align: 4
  - name: COHERENCE
    size: 4
    align: 4
  - name: NEURAL_COHERENCE
    size: 4
    align: 4
  - name: PHYSICS_READ_XS
    size: "MAX_ATOMS * 2"
    align: 2
  - name: PHYSICS_READ_YS
    size: "MAX_ATOMS * 2"
    align: 2
  - name: PHYSICS_READ_ENERGY
    size: "MAX_ATOMS * 4"
    align: 4
  - name: PHYSICS_READ_RESONANCE
    size: "MAX_ATOMS * 4"
    align: 4
  - name: ENERGY_DELTA
    size: "MAX_ATOMS * 4"
    align: 4
  - name: RESONANCE_DELTA
    size: "MAX_ATOMS * 4"
    align: 4
  - name: STRUCTURE_BUILD_OWNER
    size: "GRID_CELLS * 4"
    align: 4
  - name: STRUCTURE_BUILD_VALUE
    size: "GRID_CELLS * 4"
    align: 4
  - name: STRUCTURE_CHARGE_INTENT
    size: "GRID_CELLS * 4"
    align: 4
  - name: ATTENTION_FIELD
    size: "GRID_CELLS * 4"
    align: 4
  - name: HIVE_ENERGY_POOL
    size: "256 * 4"
    align: 4
  - name: GLYPH_HEADER
    size: "GRID_CELLS * 4"
    align: 4
  - name: GLYPH_PAYLOAD
    size: "GRID_CELLS * 8"
    align: 1
  - name: GLYPH_SCRATCH_HEADER
    size: "GRID_CELLS * 4"
    align: 4
  - name: GLYPH_SCRATCH_PAYLOAD
    size: "GRID_CELLS * 8"
    align: 1
  - name: HORMONES
    size: "8 * 2"
    align: 2
  - name: SECRETION_STATS
    size: "12 * 4"
    align: 4
  - name: LINEAGE
    size: "MAX_ATOMS * 8"
    align: 8
  - name: MAILBOX
    size: "MAX_ATOMS * 8"
    align: 4
  - name: LEDGER_HEAD
    size: 4
    align: 4
  - name: LEDGER_DATA
    size: "65536 * 16"
    align: 4
  - name: EGRESS_HEAD
    size: 4
    align: 4
  - name: EGRESS_DATA
    size: "8192 * 128"
    align: 4
  - name: METABOLISM_SCRATCH
    size: "(65536 * 4) + 128"
    align: 4
extra_symbols:
  - validateMemoryLayout
---
