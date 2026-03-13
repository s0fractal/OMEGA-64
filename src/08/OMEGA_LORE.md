# OMEGA-64 | ARCHITECTURE LORE (ONTOLOGY AST)

*Generated: 2026-03-13T14:08:24.563Z*
*Total Registered Nodes: 106*
*Causality Layers: 7*

---

## Layer L00

### `trace_atom` — *(Type: pure_fn | Level: 0)*
- **Signature:** `(idx: i32, opcode: i32, gx: i32, gy: i32, targetIdx: i32) -> void`

---

### `StructureTypes` — *(Type: enum | Level: 0)*
> Grid Structure Material Properties


---

### `VmProps` — *(Type: enum | Level: 0)*
> LambdaVM Atom Property Indices


---

### `VmSys` — *(Type: enum | Level: 0)*
> LambdaVM System Call Indices


---

### `SYSTEM_CONSTANTS` — *(Type: constants | Level: 0)*
> Core physical, spatial and computational limits


---

### `VmOpcodes` — *(Type: enum | Level: 0)*
> Instruction Set Architecture (ISA) Opcodes


---

### `pack_glyph_header` — *(Type: pure_fn | Level: 0)*
> Auto-recovered pack_glyph_header

- **Signature:** `(kind: i32, amplitude: i32) -> i32`

---

### `unpack_glyph_amplitude` — *(Type: pure_fn | Level: 0)*
> Auto-recovered unpack_glyph_amplitude

- **Signature:** `(header: i32) -> i32`

---

### `unpack_glyph_kind` — *(Type: pure_fn | Level: 0)*
> Auto-recovered unpack_glyph_kind

- **Signature:** `(header: i32) -> i32`

---

### `COS_LUT` — *(Type: static_table | Level: 0)*
> Таблиця косинусів у Q15 форматі (довжина 256)


---

### `fast_abs` — *(Type: pure_fn | Level: 0)*
> Bitwise fast absolute value calculation utilizing sign-masking without branching (i32)

- **Signature:** `(v: i32) -> i32`

---

### `fast_max` — *(Type: pure_fn | Level: 0)*
> Bitwise fast maximum calculation utilizing difference-masking without branching (i32)

- **Signature:** `(a: i32, b: i32) -> i32`

---

### `prng_next` — *(Type: pure_fn | Level: 0)*
- **Signature:** `(state: u32) -> u32`

---

### `fast_sign` — *(Type: pure_fn | Level: 0)*
> Bitwise mathematical sign extraction (-1, 0, 1) without branching

- **Signature:** `(v: i32) -> i32`

---

### `math_clamp` — *(Type: pure_fn | Level: 0)*
> Universal boundary enforcement function

- **Signature:** `(val: i32, min: i32, max: i32) -> i32`

---

### `SIN_LUT` — *(Type: static_table | Level: 0)*
> Таблиця синусів у Q15 форматі (довжина 256)


---

### `fast_min` — *(Type: pure_fn | Level: 0)*
> Bitwise fast minimum calculation utilizing difference-masking without branching (i32)

- **Signature:** `(a: i32, b: i32) -> i32`

---

### `C_LOG2_C_LUT` — *(Type: static_table | Level: 0)*
> Таблиця для швидкого розрахунку ентропії (c * log2(c))


---

### `encode_force_tuple` — *(Type: pure_fn | Level: 0)*
> Auto-recovered encode_force_tuple

- **Signature:** `(fx: f32, fy: f32) -> void`

---

### `dir8_y` — *(Type: pure_fn | Level: 0)*
> Resolve Y-axis direction (-1, 0, 1) from 8-way compass index

- **Signature:** `(n: i32) -> i32`

---

### `dir4_y` — *(Type: pure_fn | Level: 0)*
> Resolve cardinal Y-axis direction (-1, 0, 1) from 4-way compass index: 2=North, 3=South

- **Signature:** `(n: i32) -> i32`

---

### `dir4_x` — *(Type: pure_fn | Level: 0)*
> Resolve cardinal X-axis direction (-1, 0, 1) from 4-way compass index: 0=West, 1=East

- **Signature:** `(n: i32) -> i32`

---

### `dir8_x` — *(Type: pure_fn | Level: 0)*
> Resolve X-axis direction (-1, 0, 1) from 8-way compass index: 0=NW, 1=NE, 2=N, 3=S, 4=W, 5=E, 6=SW, 7=SE

- **Signature:** `(n: i32) -> i32`

---

## Layer L01

### `GRID_METRICS` — *(Type: constants | Level: 1)*
> Derived spatial grid formulas evaluating bound capacities dynamically

- **Dependencies:** `SYSTEM_CONSTANTS`
- **Variables:** `GRID_W`, `GRID_H`, `SPATIAL_CELL_SIZE`

---

### `calculate_shannon_entropy` — *(Type: pure_fn | Level: 1)*
> Швидкий розрахунок ентропії за допомогою LUT

- **Dependencies:** `C_LOG2_C_LUT`
- **Signature:** `(data: usize) -> i32`

---

### `clamp_resource` — *(Type: pure_fn | Level: 1)*
> Clamps a resource value between 0 and RESOURCE_MAX

- **Dependencies:** `SYSTEM_CONSTANTS`
- **Variables:** `RESOURCE_MAX`
- **Signature:** `(value: i64) -> i32`

---

### `math_sin` — *(Type: pure_fn | Level: 1)*
> Обчислення синуса з динамічною точністю

- **Dependencies:** `SIN_LUT`, `COS_LUT`
- **Variables:** `SIN_LUT`, `COS_LUT`
- **Signature:** `(angle: i32, highRes: i32) -> i32`

---

### `math_cos` — *(Type: pure_fn | Level: 1)*
> Обчислення косинуса з динамічною точністю (LUT, LERP, TAYLOR2)

- **Dependencies:** `SIN_LUT`, `COS_LUT`
- **Variables:** `SIN_LUT`, `COS_LUT`
- **Signature:** `(angle: i32, highRes: i32) -> i32`

---

### `in_grid` — *(Type: pure_fn | Level: 1)*
> Verify if provided coordinates fall within the topological cell grid bounds

- **Dependencies:** `SYSTEM_CONSTANTS`
- **Variables:** `GRID_W`, `GRID_H`
- **Signature:** `(x: i32, y: i32) -> boolean`

---

## Layer L02

### `OMEGA_MEMORY_LAYOUT` — *(Type: memory_layout | Level: 2)*
> Isomorphic topological mapping of all generic WebAssembly shared arrays

- **Dependencies:** `SYSTEM_CONSTANTS`, `GRID_METRICS`
- **Variables:** `MAX_ATOMS`, `SAFETY_BUFFER`, `ATOM_GENOME_SIZE`, `ATOM_INSTRUCTION_SIZE`, `ATOM_CONTEXT_SIZE`, `MAX_SPAWN_REQUESTS`, `MAX_MEIOSIS_EVENTS`, `GRID_CELLS`, `MAX_ASCENSION_STATS_RESERVED`, `HIVE_MEMORY_SIZE`, `HIVE_ENERGY_POOL_SIZE`, `MAX_HORMONES`, `SECRETION_STATS_SIZE`, `MAX_LEDGER_EVENTS`, `MAX_EGRESS_EVENTS`

---

### `clamp_world_y` — *(Type: pure_fn | Level: 2)*
> Constrain a Y coordinate to the absolute global bounds

- **Dependencies:** `GRID_METRICS`, `math_clamp`
- **Variables:** `WORLD_MAX_Y`, `math_clamp`
- **Signature:** `(y: i32) -> i32`

---

### `clamp_world_x` — *(Type: pure_fn | Level: 2)*
> Constrain an X coordinate to the absolute global bounds

- **Dependencies:** `GRID_METRICS`, `math_clamp`
- **Variables:** `WORLD_MAX_X`, `math_clamp`
- **Signature:** `(x: i32) -> i32`

---

## Layer L03

### `get_read_resonance` — *(Type: pure_fn | Level: 3)*
> Read physics buffered atom Resonance from the layout

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `PHYSICS_READ_RESONANCE_OFF`
- **Signature:** `(idx: i32) -> i32`

---

### `get_read_y` — *(Type: pure_fn | Level: 3)*
> Read physics buffered atom Y coordinate from the layout

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `PHYSICS_READ_YS_OFF`
- **Signature:** `(idx: i32) -> i16`

---

### `set_energy` — *(Type: pure_fn | Level: 3)*
> Write atom energy to the layout

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `ENERGY_OFFSET`
- **Signature:** `(idx: i32, val: i32) -> void`

---

### `set_bond_stiffness` — *(Type: pure_fn | Level: 3)*
> Set atomic bond stiffness

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `STIFFNESS_OFFSET`
- **Signature:** `(atomIdx: i32, slot: i32, val: f32) -> void`

---

### `set_role` — *(Type: pure_fn | Level: 3)*
> Write semantic role to an atom

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `ROLES_OFFSET`
- **Signature:** `(atomIdx: i32, val: u8) -> void`

---

### `get_p_c` — *(Type: pure_fn | Level: 3)*
> Read program counter of an atom

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `CONTEXT_OFFSET`
- **Signature:** `(atomIdx: i32) -> u8`

---

### `get_y` — *(Type: pure_fn | Level: 3)*
> Read atom Y coordinate from the layout

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `YS_OFFSET`
- **Signature:** `(idx: i32) -> i16`

---

### `get_hormone` — *(Type: pure_fn | Level: 3)*
> Read global hormone level atomically

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `HORMONE_OFF`
- **Signature:** `(id: i32) -> u16`

---

### `genome_key16` — *(Type: pure_fn | Level: 3)*
> Read the first two logic bytes of an atom

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `LOGIC_OFFSET`
- **Signature:** `(idx: i32) -> i32`

---

### `get_x` — *(Type: pure_fn | Level: 3)*
> Read atom X coordinate from the layout

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `XS_OFFSET`
- **Signature:** `(idx: i32) -> i16`

---

### `set_resonance` — *(Type: pure_fn | Level: 3)*
> Write atom resonance to the layout

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `clamp_resource`
- **Variables:** `RESONANCE_OFFSET`, `clamp_resource`
- **Signature:** `(idx: i32, val: i32) -> void`

---

### `set_p_c` — *(Type: pure_fn | Level: 3)*
> Set program counter of an atom

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `CONTEXT_OFFSET`
- **Signature:** `(atomIdx: i32, val: u8) -> void`

---

### `get_bond_stiffness` — *(Type: pure_fn | Level: 3)*
> Read atomic bond stiffness

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `STIFFNESS_OFFSET`
- **Signature:** `(atomIdx: i32, slot: i32) -> f32`

---

### `get_read_x` — *(Type: pure_fn | Level: 3)*
> Read physics buffered atom X coordinate from the layout

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `PHYSICS_READ_XS_OFF`
- **Signature:** `(idx: i32) -> i16`

---

### `set_bond_dist` — *(Type: pure_fn | Level: 3)*
> Set bond stretch distance in u8 representation

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `BOND_DISTANCES_OFFSET`
- **Signature:** `(atomIdx: i32, slot: i32, dist: u8) -> void`

---

### `set_reg` — *(Type: pure_fn | Level: 3)*
> Write atomic execution register

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `CONTEXT_OFFSET`
- **Signature:** `(atomIdx: i32, reg: i32, val: i32) -> void`

---

### `get_role` — *(Type: pure_fn | Level: 3)*
> Read semantic role of an atom

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `ROLES_OFFSET`
- **Signature:** `(atomIdx: i32) -> u8`

---

### `get_hive_memory` — *(Type: pure_fn | Level: 3)*
> Read byte from the organism shared neural memory block

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `HIVE_MEMORY_OFF`
- **Signature:** `(addr: i32) -> u8`

---

### `set_hive_memory` — *(Type: pure_fn | Level: 3)*
> Write byte to the organism shared neural memory block

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `HIVE_MEMORY_OFF`
- **Signature:** `(addr: i32, val: u8) -> void`

---

### `get_reg` — *(Type: pure_fn | Level: 3)*
> Read atomic execution register

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `CONTEXT_OFFSET`
- **Signature:** `(atomIdx: i32, reg: i32) -> i32`

---

### `add_hive_balance` — *(Type: pure_fn | Level: 3)*
> Atomically add integer to global hive energy pool

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `HIVE_BALANCE_OFF`
- **Signature:** `(val: i32) -> i32`

---

### `set_bond_target` — *(Type: pure_fn | Level: 3)*
> Write atom bond target by slot

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `BONDS_OFFSET`
- **Signature:** `(atomIdx: i32, slot: i32, targetIdx: i32) -> void`

---

### `get_bond_target` — *(Type: pure_fn | Level: 3)*
> Read atom bond target by slot

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `BONDS_OFFSET`
- **Signature:** `(atomIdx: i32, slot: i32) -> i32`

---

### `get_phase` — *(Type: pure_fn | Level: 3)*
> Read atom phase from the layout

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `PHASE_OFFSET`
- **Signature:** `(idx: i32) -> i32`

---

### `get_hive_balance` — *(Type: pure_fn | Level: 3)*
> Read total hive energy balance

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `HIVE_BALANCE_OFF`
- **Signature:** `() -> i32`

---

### `get_spatial_grid_atom` — *(Type: pure_fn | Level: 3)*
> Read atom reference index at grid slot

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `SPATIAL_GRID_OFFSET`, `GRID_W`
- **Signature:** `(gx: i32, gy: i32, subIdx: i32) -> i32`

---

### `add_energy_delta` — *(Type: pure_fn | Level: 3)*
> Atomic add to physics energy delta array

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `ENERGY_DELTA_OFF`
- **Signature:** `(idx: i32, delta: i32) -> void`

---

### `get_resonance` — *(Type: pure_fn | Level: 3)*
> Read atom resonance from the layout

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `RESONANCE_OFFSET`
- **Signature:** `(idx: i32) -> i32`

---

### `set_damping` — *(Type: pure_fn | Level: 3)*
> Set atomic kinetic damping factor

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `DAMPING_OFF`
- **Signature:** `(atomIdx: i32, val: u8) -> void`

---

### `get_energy` — *(Type: pure_fn | Level: 3)*
> Read atom energy from the layout

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `ENERGY_OFFSET`
- **Signature:** `(idx: i32) -> i32`

---

### `get_spatial_grid_count` — *(Type: pure_fn | Level: 3)*
> Read population density in a spatial cell

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `SPATIAL_GRID_OFFSET`, `GRID_W`
- **Signature:** `(gx: i32, gy: i32) -> i32`

---

### `get_pending_syscall` — *(Type: pure_fn | Level: 3)*
> Read pending syscall flag for an atom

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `CONTEXT_OFFSET`
- **Signature:** `(atomIdx: i32) -> u8`

---

### `get_lineage` — *(Type: pure_fn | Level: 3)*
> Read atom lineage (u64) from the layout

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `LINEAGE_OFFSET`
- **Signature:** `(idx: i32) -> u64`

---

### `get_logic_byte` — *(Type: pure_fn | Level: 3)*
> Read a specific byte from an atom's logic array

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `LOGIC_OFFSET`
- **Signature:** `(idx: i32, slot: i32) -> u8`

---

### `set_phase` — *(Type: pure_fn | Level: 3)*
> Write atom phase to the layout

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `PHASE_OFFSET`
- **Signature:** `(idx: i32, val: i32) -> void`

---

### `set_pending_syscall` — *(Type: pure_fn | Level: 3)*
> Set pending syscall flag for an atom

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `CONTEXT_OFFSET`
- **Signature:** `(atomIdx: i32, val: u8) -> void`

---

### `add_resonance_delta` — *(Type: pure_fn | Level: 3)*
> Atomic add to physics resonance delta array

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `RESONANCE_DELTA_OFF`
- **Signature:** `(idx: i32, delta: i32) -> void`

---

### `get_read_energy` — *(Type: pure_fn | Level: 3)*
> Read physics buffered atom Energy from the layout

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `PHYSICS_READ_ENERGY_OFF`
- **Signature:** `(idx: i32) -> i32`

---

### `get_neural_coherence` — *(Type: pure_fn | Level: 3)*
- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `trace_atom`, `GRID_METRICS`
- **Variables:** `GRID_CELLS`, `STRUCTURE_GRID_OFF`, `MEMORY_GRID_OFF`, `COHERENCE_OFF`
- **Signature:** `() -> i32`

---

### `clear_metabolism_stats` — *(Type: pure_fn | Level: 3)*
- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `METABOLISM_SCRATCH_OFFSET`
- **Signature:** `() -> void`

---

### `atomic_deposit_glyph_header` — *(Type: pure_fn | Level: 3)*
> Auto-recovered atomic_deposit_glyph_header

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`, `unpack_glyph_kind`, `unpack_glyph_amplitude`, `fast_abs`, `pack_glyph_header`
- **Variables:** `GRID_CELLS`, `GLYPH_HEADER_OFF`, `GLYPH_PAYLOAD_OFF`, `GLYPH_SCRATCH_PAYLOAD_OFF`
- **Signature:** `(baseOffset: usize, cell: i32, kind: i32, amplitude: i32, payloadPtr: usize) -> void`

---

### `seed_atom` — *(Type: pure_fn | Level: 3)*
> Auto-recovered seed_atom

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`
- **Variables:** `IDS_OFFSET`, `XS_OFFSET`, `YS_OFFSET`, `ENERGY_OFFSET`, `RESONANCE_OFFSET`, `PHASE_OFFSET`, `ROLES_OFFSET`, `LOGIC_OFFSET`, `LINEAGE_OFFSET`, `INSTRUCTIONS_OFFSET`, `CONTEXT_OFFSET`
- **Signature:** `(idx: i32, id: i64, x: i32, y: i32, energy: i32, resonance: i32, genomePtr: usize, lineagePtr: usize) -> void`

---

### `clear_secretion_stats` — *(Type: pure_fn | Level: 3)*
- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `SECRETION_STATS_OFF`
- **Signature:** `() -> void`

---

### `diffuse_viral_semantics` — *(Type: pure_fn | Level: 3)*
- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`, `in_grid`, `prng_next`
- **Variables:** `GRID_H`, `GRID_W`, `SIGNAL_GRID_OFF`
- **Signature:** `(pulseId: i32) -> void`

---

### `reset_neural_coherence` — *(Type: pure_fn | Level: 3)*
- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `COHERENCE_OFF`
- **Signature:** `() -> void`

---

### `diffusion_share_for_kind` — *(Type: pure_fn | Level: 3)*
> Auto-recovered diffusion_share_for_kind

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`, `fast_abs`
- **Signature:** `(kind: i32, amplitude: i32) -> i32`

---

### `decay_for_kind` — *(Type: pure_fn | Level: 3)*
> Auto-recovered decay_for_kind

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`, `fast_abs`
- **Signature:** `(kind: i32, amplitude: i32) -> i32`

---

### `set_neural_coherence` — *(Type: pure_fn | Level: 3)*
- **Dependencies:** `OMEGA_MEMORY_LAYOUT`
- **Variables:** `NEURAL_COHERENCE_OFF`
- **Signature:** `(value: i32) -> void`

---

### `find_next_free_slot` — *(Type: pure_fn | Level: 3)*
> Auto-recovered find_next_free_slot

- **Dependencies:** `SYSTEM_CONSTANTS`, `OMEGA_MEMORY_LAYOUT`
- **Variables:** `MAX_ATOMS`, `IDS_OFFSET`
- **Signature:** `(start: i32) -> i32`

---

### `get_glyph_influence` — *(Type: pure_fn | Level: 3)*
> Auto-recovered get_glyph_influence

- **Dependencies:** `SYSTEM_CONSTANTS`, `GRID_METRICS`, `OMEGA_MEMORY_LAYOUT`
- **Variables:** `GRID_W`, `GRID_H`, `GLYPH_HEADER_OFF`, `ROLE_PARASITE`, `ROLE_GUARDIAN`, `ROLE_ARCHITECT`
- **Signature:** `(gx: i32, gy: i32, role: u8) -> f32`

---

### `get_attention_cell` — *(Type: pure_fn | Level: 3)*
> Auto-recovered get_attention_cell

- **Dependencies:** `GRID_METRICS`, `OMEGA_MEMORY_LAYOUT`
- **Variables:** `GRID_W`, `GRID_H`, `ATTENTION_FIELD_OFF`
- **Signature:** `(gx: i32, gy: i32) -> f32`

---

### `read_structure_cell` — *(Type: pure_fn | Level: 3)*
> Auto-recovered read_structure_cell

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `SYSTEM_CONSTANTS`
- **Variables:** `STRUCTURE_BUILD_OWNER_OFF`, `STRUCTURE_BUILD_VALUE_OFF`, `STRUCTURE_GRID_OFF`, `STRUCTURE_INTENT_SPIN_LIMIT`, `STRUCTURE_INTENT_LOCK_BIT`, `STRUCTURE_INTENT_OWNER_MASK`
- **Signature:** `(cellIdx: i32) -> i32`

---

### `publish_charge_intent` — *(Type: pure_fn | Level: 3)*
> Auto-recovered publish_charge_intent

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`, `fast_max`
- **Variables:** `STRUCTURE_CHARGE_INTENT_OFF`, `STRUCTURE_INTENT_SPIN_LIMIT`
- **Signature:** `(cellIdx: i32, requestedCharge: i32) -> void`

---

### `publish_build_intent` — *(Type: pure_fn | Level: 3)*
> Auto-recovered publish_build_intent

- **Dependencies:** `SYSTEM_CONSTANTS`, `OMEGA_MEMORY_LAYOUT`
- **Variables:** `STRUCTURE_INTENT_SPIN_LIMIT`, `STRUCTURE_INTENT_LOCK_BIT`, `STRUCTURE_INTENT_OWNER_MASK`, `STRUCTURE_BUILD_OWNER_OFF`, `STRUCTURE_BUILD_VALUE_OFF`
- **Signature:** `(ownerAtomIdx: i32, cellIdx: i32, buildValue: i32) -> void`

---

### `reduce_atom_deltas` — *(Type: pure_fn | Level: 3)*
- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `clamp_resource`
- **Variables:** `ENERGY_DELTA_OFF`, `ENERGY_OFFSET`, `RESONANCE_DELTA_OFF`, `RESONANCE_OFFSET`, `MAX_ATOMS`
- **Signature:** `(startIdx: i32, endIdx: i32) -> void`

---

### `store_clamped_pos` — *(Type: pure_fn | Level: 3)*
> Store an atom's physical coordinates directly into shared memory with strict bounding enforcement

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `clamp_world_x`, `clamp_world_y`
- **Variables:** `XS_OFFSET`, `YS_OFFSET`, `clamp_world_x`, `clamp_world_y`
- **Signature:** `(idx: i32, x: i32, y: i32) -> void`

---

## Layer L04

### `build_spatial_hash` — *(Type: pure_fn | Level: 4)*
> Distributes atoms into a spatial hash grid for O(1) proximity lookups, tracks overflow, and returns a packed i64 tuple of (hashMaxCellCount | hashOverflowCount).

- **Dependencies:** `get_x`, `get_y`, `get_phase`, `get_role`
- **Variables:** `MAX_ATOMS`, `GRID_CELLS`, `GRID_W`, `WORLD_MAX_X`, `WORLD_MAX_Y`, `SPATIAL_CELL_SIZE`, `SPATIAL_GRID_OFFSET`, `QUORUM_OFFSET`, `IDS_OFFSET`
- **Signature:** `() -> i64`

---

### `add_resonance` — *(Type: pure_fn | Level: 4)*
> Add a delta to atom resonance in the layout

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `get_resonance`, `set_resonance`
- **Variables:** `get_resonance`, `set_resonance`
- **Signature:** `(idx: i32, delta: i32) -> void`

---

### `secrete_glyph` — *(Type: pure_fn | Level: 4)*
> Auto-recovered secrete_glyph

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`, `get_energy`, `set_energy`
- **Variables:** `SPATIAL_CELL_SIZE`, `GRID_W`, `GRID_H`, `SECRETION_STATS_OFF`, `PHEROMONE_COST_BASE`, `PLASMID_COST_BASE`
- **Signature:** `(atomIdx: i32, x: i32, y: i32, kind: u8, role: u8, intensity: i32) -> void`

---

### `drain_spawn_requests` — *(Type: pure_fn | Level: 4)*
> Auto-recovered drain_spawn_requests

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`, `find_next_free_slot`, `seed_atom`
- **Variables:** `SPAWN_HEAD_OFF`, `SPAWN_DATA_OFF`, `SPAWN_MAX`, `SPAWN_SLOT`, `MAX_ATOMS`
- **Signature:** `(tick: i32) -> i32`

---

### `apply_metabolism_kernel` — *(Type: pure_fn | Level: 4)*
- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `get_energy`, `set_energy`, `genome_key16`, `fast_abs`
- **Variables:** `METABOLISM_SCRATCH_OFFSET`, `IDS_OFFSET`, `ROLES_OFFSET`, `RESONANCE_OFFSET`, `CONTEXT_OFFSET`, `XS_OFFSET`, `YS_OFFSET`, `SPATIAL_CELL_SIZE`, `GRID_W`, `STRUCTURE_GRID_OFF`, `MEMORY_GRID_OFF`, `MAX_ATOMS`, `ENERGY_OFFSET`, `BONDS_OFFSET`
- **Signature:** `(startIdx: i32, endIdx: i32, noveltySigned: i32, symbiosisSigned: i32, baseTax: i32, targetEnergy: i32, homeostasisBand: i32, homeostasisMaxDelta: i32, overflowThreshold: i32, spatialOverflowRatio: i32, starvationFloor: i32, subsidyEnabled: i32) -> void`

---

### `accumulate_metabolism_stats` — *(Type: pure_fn | Level: 4)*
- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `genome_key16`
- **Variables:** `IDS_OFFSET`, `METABOLISM_SCRATCH_OFFSET`
- **Signature:** `(startIdx: i32, endIdx: i32) -> void`

---

### `glyph_transport` — *(Type: pure_fn | Level: 4)*
> Auto-recovered glyph_transport

- **Dependencies:** `atomic_deposit_glyph_header`, `diffusion_share_for_kind`, `decay_for_kind`, `pack_glyph_header`, `unpack_glyph_amplitude`, `unpack_glyph_kind`, `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`, `fast_abs`, `fast_max`, `fast_min`, `in_grid`
- **Variables:** `GRID_CELLS`, `GLYPH_HEADER_OFF`, `GLYPH_PAYLOAD_OFF`, `GLYPH_SCRATCH_PAYLOAD_OFF`, `GLYPH_SCRATCH_HEADER_OFF`, `GRID_W`, `SIGNAL_GRID_OFF`, `SECRETION_STATS_OFF`, `MEMORY_GRID_OFF`
- **Signature:** `(tick: i32) -> void`

---

### `calculate_trophism` — *(Type: pure_fn | Level: 4)*
> Auto-recovered calculate_trophism

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`, `get_read_energy`, `in_grid`, `get_spatial_grid_count`, `get_spatial_grid_atom`, `get_read_x`, `get_read_y`, `get_role`, `add_energy_delta`, `add_resonance_delta`, `get_read_resonance`, `get_attention_cell`, `get_glyph_influence`, `read_structure_cell`, `encode_force_tuple`
- **Variables:** `SPATIAL_CELL_SIZE`, `MAX_ATOMS`, `ROLE_PRODUCER`, `ROLE_NEUTRAL`, `ROLE_GUARDIAN`, `ROLE_PARASITE`, `ROLE_ARCHITECT`, `GRID_W`
- **Signature:** `(idx: i32, x: i32, y: i32, role: u8) -> void`

---

### `apply_bond_springs` — *(Type: pure_fn | Level: 4)*
> Auto-recovered apply_bond_springs

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`, `get_bond_target`, `get_bond_stiffness`, `get_read_x`, `get_read_y`, `get_read_resonance`, `add_resonance_delta`, `encode_force_tuple`
- **Variables:** `DAMPING_OFF`, `MAX_ATOMS`, `BOND_DISTANCES_OFFSET`
- **Signature:** `(idx: i32, x: i32, y: i32) -> void`

---

### `fire_signal` — *(Type: pure_fn | Level: 4)*
> Auto-recovered fire_signal

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`, `get_bond_target`, `get_bond_stiffness`, `add_resonance_delta`
- **Variables:** `MAX_ATOMS`
- **Signature:** `(idx: i32) -> void`

---

### `get_genome_velocity_y` — *(Type: pure_fn | Level: 4)*
> Auto-recovered get_genome_velocity_y

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`, `get_logic_byte`
- **Signature:** `(idx: i32) -> i32`

---

### `get_genome_velocity_x` — *(Type: pure_fn | Level: 4)*
> Auto-recovered get_genome_velocity_x

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`, `get_logic_byte`
- **Signature:** `(idx: i32) -> i32`

---

### `read_structure_charge` — *(Type: pure_fn | Level: 4)*
> Auto-recovered read_structure_charge

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`, `read_structure_cell`
- **Variables:** `STRUCTURE_CHARGE_INTENT_OFF`
- **Signature:** `(cellIdx: i32) -> i32`

---

### `resolve_bond_requests` — *(Type: pure_fn | Level: 4)*
> Auto-recovered resolve_bond_requests

- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`, `set_bond_target`, `set_bond_stiffness`, `get_bond_target`
- **Variables:** `BOND_REQUESTS_OFFSET`, `MAX_ATOMS`
- **Signature:** `(start: i32, end: i32) -> void`

---

## Layer L05

### `evaluate_opcodes` — *(Type: pure_fn | Level: 5)*
- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`, `VmOpcodes`, `VmProps`, `get_p_c`, `set_p_c`, `get_x`, `get_y`, `get_phase`, `set_phase`, `get_reg`, `set_reg`, `get_spatial_grid_count`, `get_spatial_grid_atom`, `get_hormone`, `set_energy`, `set_resonance`, `set_pending_syscall`, `in_grid`, `read_structure_charge`, `math_sin`, `math_cos`
- **Variables:** `INSTRUCTIONS_OFFSET`, `MAX_ATOMS`, `GRID_W`, `NEURAL_COHERENCE_OFF`, `MEMORY_GRID_OFF`, `OP_NOP`, `OP_SET`, `OP_GET`, `OP_PUT`, `OP_ADD`, `OP_SUB`, `OP_JNZ`, `OP_JMP`, `OP_SYSCALL`, `OP_RESOLVE`, `OP_RESONATE_KURAMOTO`, `OP_SPORE_DRIVE`, `OP_SENSE_AS`, `PROP_ENERGY`, `PROP_RESONANCE`, `PROP_X`, `PROP_Y`, `PROP_PHASE`, `PROP_GRID_CHARGE`, `PROP_QUORUM`, `PROP_NEURAL_COHERENCE`, `PROP_MEMORY`, `PROP_CONSENSUS`
- **Signature:** `(atomIndex: i32, energy: i32, resonance: i32, mass: i32) -> i32`

---

### `tick_structure_grid` — *(Type: pure_fn | Level: 5)*
- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`, `dir8_x`, `dir8_y`, `dir4_x`, `dir4_y`, `in_grid`, `trace_atom`, `read_structure_charge`
- **Variables:** `GRID_H`, `GRID_W`, `STRUCTURE_GRID_OFF`, `STRUCTURE_BUILD_OWNER_OFF`, `STRUCTURE_BUILD_VALUE_OFF`, `STRUCTURE_CHARGE_INTENT_OFF`, `STR_VOID`, `STR_WIRE`, `STR_SOURCE`, `STR_NODE`, `STR_CAPACITOR`, `STR_DIODE`, `STR_INVERTER`, `STR_LATCH`, `SPATIAL_GRID_OFFSET`, `SIGNAL_GRID_OFF`, `MEMORY_GRID_OFF`
- **Signature:** `() -> void`

---

## Layer L06

### `execute_atom` — *(Type: pure_fn | Level: 6)*
> Auto-recovered execute_atom

- **Dependencies:** `evaluate_opcodes`, `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`, `get_p_c`, `get_read_energy`, `get_read_resonance`, `get_hormone`, `get_phase`, `set_phase`, `set_resonance`, `fire_signal`, `get_energy`, `get_resonance`, `set_energy`
- **Variables:** `IDS_OFFSET`, `INSTRUCTIONS_OFFSET`, `BONDS_OFFSET`, `MAX_ATOMS`, `NEURAL_COHERENCE_OFF`
- **Signature:** `(atomIndex: i32) -> void`

---

### `tick_environment` — *(Type: pure_fn | Level: 6)*
- **Dependencies:** `OMEGA_MEMORY_LAYOUT`, `GRID_METRICS`, `tick_structure_grid`, `diffuse_viral_semantics`, `glyph_transport`
- **Variables:** `GRID_CELLS`, `ATTENTION_FIELD_OFF`
- **Signature:** `(tick: i32) -> void`

---

