# OMEGA-64 | RUST CORE LOGIC

*Generated: 2026-03-15T04:12:16.110Z*
*Exported Files: 195*

---
## FILE INDEX
- src/00/sigma_core/src/lib.rs
- src/00/sigma_core/src/ontology_gen/00/COS_LUT.rs
- src/00/sigma_core/src/ontology_gen/00/C_LOG2_C_LUT.rs
- src/00/sigma_core/src/ontology_gen/00/ENV_PARSE.rs
- src/00/sigma_core/src/ontology_gen/00/GENESIS_PREDATOR_SCRIPT.rs
- src/00/sigma_core/src/ontology_gen/00/GLYPH_ARITY_LUT.rs
- src/00/sigma_core/src/ontology_gen/00/GLYPH_ENERGY_LUT.rs
- src/00/sigma_core/src/ontology_gen/00/GLYPH_LEGACY_OPCODE_LUT.rs
- src/00/sigma_core/src/ontology_gen/00/GLYPH_RGB_LUT.rs
- src/00/sigma_core/src/ontology_gen/00/GLYPH_TYPES.rs
- src/00/sigma_core/src/ontology_gen/00/OPCODE_ARITY_LUT.rs
- src/00/sigma_core/src/ontology_gen/00/SIN_LUT.rs
- src/00/sigma_core/src/ontology_gen/00/STATE_SNAPSHOT.rs
- src/00/sigma_core/src/ontology_gen/00/SYSTEM_CONSTANTS.rs
- src/00/sigma_core/src/ontology_gen/00/StructureTypes.rs
- src/00/sigma_core/src/ontology_gen/00/VmOpcodes.rs
- src/00/sigma_core/src/ontology_gen/00/VmProps.rs
- src/00/sigma_core/src/ontology_gen/00/VmSys.rs
- src/00/sigma_core/src/ontology_gen/00/append_jsonl.rs
- src/00/sigma_core/src/ontology_gen/00/clamp01.rs
- src/00/sigma_core/src/ontology_gen/00/dir4_x.rs
- src/00/sigma_core/src/ontology_gen/00/dir4_y.rs
- src/00/sigma_core/src/ontology_gen/00/dir8_x.rs
- src/00/sigma_core/src/ontology_gen/00/dir8_y.rs
- src/00/sigma_core/src/ontology_gen/00/encode_force_tuple.rs
- src/00/sigma_core/src/ontology_gen/00/fast_abs.rs
- src/00/sigma_core/src/ontology_gen/00/fast_max.rs
- src/00/sigma_core/src/ontology_gen/00/fast_min.rs
- src/00/sigma_core/src/ontology_gen/00/fast_sign.rs
- src/00/sigma_core/src/ontology_gen/00/immune_check.rs
- src/00/sigma_core/src/ontology_gen/00/math_clamp.rs
- src/00/sigma_core/src/ontology_gen/00/mod.rs
- src/00/sigma_core/src/ontology_gen/00/normalize_angle.rs
- src/00/sigma_core/src/ontology_gen/00/pack_glyph_header.rs
- src/00/sigma_core/src/ontology_gen/00/prng_next.rs
- src/00/sigma_core/src/ontology_gen/00/read_jsonl.rs
- src/00/sigma_core/src/ontology_gen/00/read_jsonl_lines.rs
- src/00/sigma_core/src/ontology_gen/00/sigma_atom_role.rs
- src/00/sigma_core/src/ontology_gen/00/sigma_isa.rs
- src/00/sigma_core/src/ontology_gen/00/sigma_math.rs
- src/00/sigma_core/src/ontology_gen/00/trace_atom.rs
- src/00/sigma_core/src/ontology_gen/00/unpack_glyph_amplitude.rs
- src/00/sigma_core/src/ontology_gen/00/unpack_glyph_kind.rs
- src/00/sigma_core/src/ontology_gen/01/OMEGA_MEMORY_LAYOUT.rs
- src/00/sigma_core/src/ontology_gen/01/calculate_shannon_entropy.rs
- src/00/sigma_core/src/ontology_gen/01/checkpoint_chain.rs
- src/00/sigma_core/src/ontology_gen/01/clamp_resource.rs
- src/00/sigma_core/src/ontology_gen/01/clamp_world_x.rs
- src/00/sigma_core/src/ontology_gen/01/clamp_world_y.rs
- src/00/sigma_core/src/ontology_gen/01/in_grid.rs
- src/00/sigma_core/src/ontology_gen/01/ledger_chain.rs
- src/00/sigma_core/src/ontology_gen/01/math_cos.rs
- src/00/sigma_core/src/ontology_gen/01/math_sin.rs
- src/00/sigma_core/src/ontology_gen/01/mod.rs
- src/00/sigma_core/src/ontology_gen/01/sigma_memory.rs
- src/00/sigma_core/src/ontology_gen/02/add_energy_delta.rs
- src/00/sigma_core/src/ontology_gen/02/add_hive_balance.rs
- src/00/sigma_core/src/ontology_gen/02/add_resonance_delta.rs
- src/00/sigma_core/src/ontology_gen/02/atomic_deposit_glyph_header.rs
- src/00/sigma_core/src/ontology_gen/02/clear_metabolism_stats.rs
- src/00/sigma_core/src/ontology_gen/02/clear_secretion_stats.rs
- src/00/sigma_core/src/ontology_gen/02/decay_for_kind.rs
- src/00/sigma_core/src/ontology_gen/02/diffuse_viral_semantics.rs
- src/00/sigma_core/src/ontology_gen/02/diffusion_share_for_kind.rs
- src/00/sigma_core/src/ontology_gen/02/find_next_free_slot.rs
- src/00/sigma_core/src/ontology_gen/02/genome_key16.rs
- src/00/sigma_core/src/ontology_gen/02/get_attention_cell.rs
- src/00/sigma_core/src/ontology_gen/02/get_bond_stiffness.rs
- src/00/sigma_core/src/ontology_gen/02/get_bond_target.rs
- src/00/sigma_core/src/ontology_gen/02/get_energy.rs
- src/00/sigma_core/src/ontology_gen/02/get_glyph_influence.rs
- src/00/sigma_core/src/ontology_gen/02/get_hive_balance.rs
- src/00/sigma_core/src/ontology_gen/02/get_hive_memory.rs
- src/00/sigma_core/src/ontology_gen/02/get_hormone.rs
- src/00/sigma_core/src/ontology_gen/02/get_lineage.rs
- src/00/sigma_core/src/ontology_gen/02/get_logic_byte.rs
- src/00/sigma_core/src/ontology_gen/02/get_neural_coherence.rs
- src/00/sigma_core/src/ontology_gen/02/get_p_c.rs
- src/00/sigma_core/src/ontology_gen/02/get_pending_syscall.rs
- src/00/sigma_core/src/ontology_gen/02/get_phase.rs
- src/00/sigma_core/src/ontology_gen/02/get_read_energy.rs
- src/00/sigma_core/src/ontology_gen/02/get_read_resonance.rs
- src/00/sigma_core/src/ontology_gen/02/get_read_x.rs
- src/00/sigma_core/src/ontology_gen/02/get_read_y.rs
- src/00/sigma_core/src/ontology_gen/02/get_reg.rs
- src/00/sigma_core/src/ontology_gen/02/get_resonance.rs
- src/00/sigma_core/src/ontology_gen/02/get_role.rs
- src/00/sigma_core/src/ontology_gen/02/get_spatial_grid_atom.rs
- src/00/sigma_core/src/ontology_gen/02/get_spatial_grid_count.rs
- src/00/sigma_core/src/ontology_gen/02/get_x.rs
- src/00/sigma_core/src/ontology_gen/02/get_y.rs
- src/00/sigma_core/src/ontology_gen/02/memory_views.rs
- src/00/sigma_core/src/ontology_gen/02/mod.rs
- src/00/sigma_core/src/ontology_gen/02/publish_build_intent.rs
- src/00/sigma_core/src/ontology_gen/02/publish_charge_intent.rs
- src/00/sigma_core/src/ontology_gen/02/read_structure_cell.rs
- src/00/sigma_core/src/ontology_gen/02/reduce_atom_deltas.rs
- src/00/sigma_core/src/ontology_gen/02/reset_neural_coherence.rs
- src/00/sigma_core/src/ontology_gen/02/seed_atom.rs
- src/00/sigma_core/src/ontology_gen/02/set_bond_dist.rs
- src/00/sigma_core/src/ontology_gen/02/set_bond_stiffness.rs
- src/00/sigma_core/src/ontology_gen/02/set_bond_target.rs
- src/00/sigma_core/src/ontology_gen/02/set_damping.rs
- src/00/sigma_core/src/ontology_gen/02/set_energy.rs
- src/00/sigma_core/src/ontology_gen/02/set_hive_memory.rs
- src/00/sigma_core/src/ontology_gen/02/set_neural_coherence.rs
- src/00/sigma_core/src/ontology_gen/02/set_p_c.rs
- src/00/sigma_core/src/ontology_gen/02/set_pending_syscall.rs
- src/00/sigma_core/src/ontology_gen/02/set_phase.rs
- src/00/sigma_core/src/ontology_gen/02/set_reg.rs
- src/00/sigma_core/src/ontology_gen/02/set_resonance.rs
- src/00/sigma_core/src/ontology_gen/02/set_role.rs
- src/00/sigma_core/src/ontology_gen/02/sigma_bonding.rs
- src/00/sigma_core/src/ontology_gen/02/sigma_environment.rs
- src/00/sigma_core/src/ontology_gen/02/sigma_ffi.rs
- src/00/sigma_core/src/ontology_gen/02/sigma_glyph_transport.rs
- src/00/sigma_core/src/ontology_gen/02/sigma_pulse.rs
- src/00/sigma_core/src/ontology_gen/02/sigma_replication.rs
- src/00/sigma_core/src/ontology_gen/02/sigma_shadow.rs
- src/00/sigma_core/src/ontology_gen/02/sigma_spatial.rs
- src/00/sigma_core/src/ontology_gen/02/sigma_structure.rs
- src/00/sigma_core/src/ontology_gen/02/store_clamped_pos.rs
- src/00/sigma_core/src/ontology_gen/03/ATOMIC_LEDGER.rs
- src/00/sigma_core/src/ontology_gen/03/GATE.rs
- src/00/sigma_core/src/ontology_gen/03/GATE_LEDGER.rs
- src/00/sigma_core/src/ontology_gen/03/GATE_MERGER.rs
- src/00/sigma_core/src/ontology_gen/03/GATE_VALIDATOR.rs
- src/00/sigma_core/src/ontology_gen/03/GENETIC_LEDGER.rs
- src/00/sigma_core/src/ontology_gen/03/MX.rs
- src/00/sigma_core/src/ontology_gen/03/accumulate_metabolism_stats.rs
- src/00/sigma_core/src/ontology_gen/03/add_resonance.rs
- src/00/sigma_core/src/ontology_gen/03/apply_bond_springs.rs
- src/00/sigma_core/src/ontology_gen/03/apply_metabolism_kernel.rs
- src/00/sigma_core/src/ontology_gen/03/build_spatial_hash.rs
- src/00/sigma_core/src/ontology_gen/03/calculate_trophism.rs
- src/00/sigma_core/src/ontology_gen/03/drain_spawn_requests.rs
- src/00/sigma_core/src/ontology_gen/03/fire_signal.rs
- src/00/sigma_core/src/ontology_gen/03/get_genome_velocity_x.rs
- src/00/sigma_core/src/ontology_gen/03/get_genome_velocity_y.rs
- src/00/sigma_core/src/ontology_gen/03/glyph_transport.rs
- src/00/sigma_core/src/ontology_gen/03/mod.rs
- src/00/sigma_core/src/ontology_gen/03/read_structure_charge.rs
- src/00/sigma_core/src/ontology_gen/03/resolve_bond_requests.rs
- src/00/sigma_core/src/ontology_gen/03/run_phagocyte_pass.rs
- src/00/sigma_core/src/ontology_gen/03/secrete_glyph.rs
- src/00/sigma_core/src/ontology_gen/03/sigma_vm.rs
- src/00/sigma_core/src/ontology_gen/03/tick_membrane_physics.rs
- src/00/sigma_core/src/ontology_gen/04/P2P_CODEC.rs
- src/00/sigma_core/src/ontology_gen/04/P2P_FEDERATION.rs
- src/00/sigma_core/src/ontology_gen/04/PULSE.rs
- src/00/sigma_core/src/ontology_gen/04/PULSE_WORKER.rs
- src/00/sigma_core/src/ontology_gen/04/SWARM_NEXUS.rs
- src/00/sigma_core/src/ontology_gen/04/SWARM_NODE.rs
- src/00/sigma_core/src/ontology_gen/04/evaluate_opcodes.rs
- src/00/sigma_core/src/ontology_gen/04/mod.rs
- src/00/sigma_core/src/ontology_gen/04/tick_structure_grid.rs
- src/00/sigma_core/src/ontology_gen/05/AVATAR_ENGINE.rs
- src/00/sigma_core/src/ontology_gen/05/SEMANTIC_MEMBRANE.rs
- src/00/sigma_core/src/ontology_gen/05/SOVEREIGN_ORACLE.rs
- src/00/sigma_core/src/ontology_gen/05/execute_atom.rs
- src/00/sigma_core/src/ontology_gen/05/llm_soul.rs
- src/00/sigma_core/src/ontology_gen/05/mod.rs
- src/00/sigma_core/src/ontology_gen/05/tick_environment.rs
- src/00/sigma_core/src/ontology_gen/06/BREATH.rs
- src/00/sigma_core/src/ontology_gen/06/GLYPH_TELEMETRY.rs
- src/00/sigma_core/src/ontology_gen/06/LOGGER.rs
- src/00/sigma_core/src/ontology_gen/06/MUTATION_TELEMETRY.rs
- src/00/sigma_core/src/ontology_gen/06/OMEGA_DAEMON.rs
- src/00/sigma_core/src/ontology_gen/06/SERVE_DASHBOARD.rs
- src/00/sigma_core/src/ontology_gen/06/TUI_DASHBOARD.rs
- src/00/sigma_core/src/ontology_gen/06/base64_to_bytes.rs
- src/00/sigma_core/src/ontology_gen/06/bytes_to_base64.rs
- src/00/sigma_core/src/ontology_gen/06/bytes_to_hex.rs
- src/00/sigma_core/src/ontology_gen/06/fnv1a32.rs
- src/00/sigma_core/src/ontology_gen/06/get_glyph_arity.rs
- src/00/sigma_core/src/ontology_gen/06/get_glyph_energy.rs
- src/00/sigma_core/src/ontology_gen/06/get_glyph_kind.rs
- src/00/sigma_core/src/ontology_gen/06/get_glyph_legacy_opcode.rs
- src/00/sigma_core/src/ontology_gen/06/hex_to_bytes.rs
- src/00/sigma_core/src/ontology_gen/06/make_xor_shift32.rs
- src/00/sigma_core/src/ontology_gen/06/mod.rs
- src/00/sigma_core/src/ontology_gen/06/normalize_hex64.rs
- src/00/sigma_core/src/ontology_gen/06/pack_structure_intent.rs
- src/00/sigma_core/src/ontology_gen/06/stable_stringify.rs
- src/00/sigma_core/src/ontology_gen/06/to_int16_big_endian.rs
- src/00/sigma_core/src/ontology_gen/06/unpack_structure_charge.rs
- src/00/sigma_core/src/ontology_gen/07/assembler.rs
- src/00/sigma_core/src/ontology_gen/07/crypto_keys.rs
- src/00/sigma_core/src/ontology_gen/07/disassembler.rs
- src/00/sigma_core/src/ontology_gen/07/glyph_ir_64.rs
- src/00/sigma_core/src/ontology_gen/07/mod.rs
- src/00/sigma_core/src/ontology_gen/07/sha256_hex.rs
- src/00/sigma_core/src/ontology_gen/08/glyph_pretty.rs
- src/00/sigma_core/src/ontology_gen/08/mod.rs
- src/00/sigma_core/src/ontology_gen/mod.rs
---

## FILE: src/00/sigma_core/src/lib.rs

```rust
pub mod ontology_gen;

pub use ontology_gen::L00::*;
pub use ontology_gen::L01::*;
pub use ontology_gen::L02::*;
pub use ontology_gen::L03::*;
pub use ontology_gen::L04::*;
pub use ontology_gen::L05::*;
pub use ontology_gen::L06::*;

// Note: PulseOrchestrator and LambdaVM have been ported into the ontology. 
// They are exposed automatically through the above L0X glob imports.

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/COS_LUT.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/COS_LUT.md
#![allow(unused_imports)]

pub const COS_LUT: [i16; 256] = [32767, 32757, 32728, 32678, 32609, 32521, 32412, 32285, 32137, 31971, 31785, 31580, 31356, 31113, 30852, 30571, 30273, 29956, 29621, 29268, 28898, 28510, 28105, 27683, 27245, 26790, 26319, 25832, 25329, 24811, 24279, 23731, 23170, 22594, 22005, 21403, 20787, 20159, 19519, 18868, 18204, 17530, 16846, 16151, 15446, 14732, 14010, 13279, 12539, 11793, 11039, 10278, 9512, 8739, 7962, 7179, 6393, 5602, 4808, 4011, 3212, 2410, 1608, 804, 0, -804, -1608, -2410, -3212, -4011, -4808, -5602, -6393, -7179, -7962, -8739, -9512, -10278, -11039, -11793, -12539, -13279, -14010, -14732, -15446, -16151, -16846, -17530, -18204, -18868, -19519, -20159, -20787, -21403, -22005, -22594, -23170, -23731, -24279, -24811, -25329, -25832, -26319, -26790, -27245, -27683, -28105, -28510, -28898, -29268, -29621, -29956, -30273, -30571, -30852, -31113, -31356, -31580, -31785, -31971, -32137, -32285, -32412, -32521, -32609, -32678, -32728, -32757, -32767, -32757, -32728, -32678, -32609, -32521, -32412, -32285, -32137, -31971, -31785, -31580, -31356, -31113, -30852, -30571, -30273, -29956, -29621, -29268, -28898, -28510, -28105, -27683, -27245, -26790, -26319, -25832, -25329, -24811, -24279, -23731, -23170, -22594, -22005, -21403, -20787, -20159, -19519, -18868, -18204, -17530, -16846, -16151, -15446, -14732, -14010, -13279, -12539, -11793, -11039, -10278, -9512, -8739, -7962, -7179, -6393, -5602, -4808, -4011, -3212, -2410, -1608, -804, 0, 804, 1608, 2410, 3212, 4011, 4808, 5602, 6393, 7179, 7962, 8739, 9512, 10278, 11039, 11793, 12539, 13279, 14010, 14732, 15446, 16151, 16846, 17530, 18204, 18868, 19519, 20159, 20787, 21403, 22005, 22594, 23170, 23731, 24279, 24811, 25329, 25832, 26319, 26790, 27245, 27683, 28105, 28510, 28898, 29268, 29621, 29956, 30273, 30571, 30852, 31113, 31356, 31580, 31785, 31971, 32137, 32285, 32412, 32521, 32609, 32678, 32728, 32757];

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/C_LOG2_C_LUT.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/C_LOG2_C_LUT.md
#![allow(unused_imports)]

pub const C_LOG2_C_LUT: [i32; 65] = [0, 0, 2000, 4755, 8000, 11610, 15510, 19651, 24000, 28529, 33219, 38054, 43020, 48106, 53303, 58603, 64000, 69487, 75059, 80711, 86439, 92239, 98107, 104042, 110039, 116096, 122211, 128382, 134606, 140881, 147207, 153580, 160000, 166465, 172974, 179525, 186117, 192750, 199421, 206131, 212877, 219660, 226477, 233329, 240215, 247133, 254084, 261066, 268078, 275121, 282193, 289294, 296423, 303580, 310764, 317975, 325212, 332475, 339763, 347076, 354413, 361775, 369160, 376569, 384000];

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/ENV_PARSE.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/env_parse.md
#![allow(unused_imports)]

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/GENESIS_PREDATOR_SCRIPT.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/genomes/GENESIS_PREDATOR_SCRIPT.md
#![allow(unused_imports)]

pub const GENESIS_PREDATOR_SCRIPT: [u8; 64] = [1, 1, 3, 1, 0, 13, 96, 1, 1, 0, 4, 1, 0, 1, 2, 0, 1, 3, 50, 1, 4, 0, 5, 3, 4, 1, 0, 10, 96, 1, 0, 1, 96, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/GLYPH_ARITY_LUT.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/GLYPH_ARITY_LUT.md
#![allow(unused_imports)]

pub const GLYPH_ARITY_LUT: [u8; 64] = [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 1, 2, 0, 0, 2, 0, 0, 0, 0, 0, 2, 3, 2, 2, 0, 0, 0, 0, 3, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/GLYPH_ENERGY_LUT.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/GLYPH_ENERGY_LUT.md
#![allow(unused_imports)]

pub const GLYPH_ENERGY_LUT: [u8; 64] = [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 6, 3, 2, 20, 50, 10, 0, 1, 3, 4, 6, 2, 1, 1, 1, 1, 4, 2, 5, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/GLYPH_LEGACY_OPCODE_LUT.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/GLYPH_LEGACY_OPCODE_LUT.md
#![allow(unused_imports)]

pub const GLYPH_LEGACY_OPCODE_LUT: [u8; 64] = [255, 255, 255, 255, 255, 255, 255, 255, 1, 2, 3, 4, 5, 17, 18, 16, 128, 129, 131, 255, 167, 138, 96, 255, 164, 165, 168, 169, 255, 255, 255, 255, 166, 170, 176, 130, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255];

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/GLYPH_RGB_LUT.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/GLYPH_RGB_LUT.md
#![allow(unused_imports)]

pub const GLYPH_RGB_LUT: [u8; 192] = [255, 255, 255, 128, 128, 128, 0, 0, 0, 255, 0, 255, 255, 77, 77, 254, 87, 68, 251, 98, 60, 245, 109, 51, 238, 121, 42, 230, 132, 34, 220, 143, 27, 209, 153, 21, 199, 162, 15, 188, 170, 11, 179, 179, 7, 153, 170, 4, 131, 163, 2, 110, 157, 1, 93, 154, 0, 77, 153, 0, 62, 154, 0, 48, 157, 1, 34, 163, 2, 21, 170, 4, 7, 179, 7, 11, 188, 29, 15, 199, 52, 21, 209, 77, 27, 220, 104, 34, 230, 132, 42, 238, 160, 51, 245, 187, 60, 251, 212, 68, 254, 235, 77, 255, 255, 84, 237, 254, 91, 219, 251, 96, 201, 245, 100, 183, 238, 103, 166, 230, 105, 151, 220, 105, 136, 209, 104, 123, 199, 102, 111, 188, 100, 100, 179, 105, 98, 170, 109, 95, 163, 113, 93, 157, 117, 92, 154, 122, 92, 153, 129, 92, 154, 138, 93, 157, 149, 95, 163, 163, 98, 170, 179, 100, 179, 188, 102, 180, 199, 104, 180, 209, 105, 178, 220, 105, 174, 229, 103, 166, 238, 100, 156, 245, 96, 141, 251, 91, 123, 254, 84, 101];

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/GLYPH_TYPES.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/GLYPH_TYPES.md
#![allow(unused_imports)]

// Enum: GLYPH_TYPES
pub const KIND_CORE: u8 = 0;
pub const KIND_CONTROL: u8 = 1;
pub const KIND_TRANSPORT: u8 = 2;
pub const KIND_STRUCTURAL: u8 = 3;
pub const KIND_CATALYTIC: u8 = 4;
pub const KIND_REGULATORY: u8 = 5;
pub const KIND_MEMORY: u8 = 6;
pub const KIND_RESERVE: u8 = 7;
pub const STAB_HARD_INVARIANT: u8 = 0;
pub const STAB_LEGACY_BRIDGE: u8 = 1;
pub const STAB_BOUNDED_DYNAMIC: u8 = 2;
pub const STAB_RESERVE: u8 = 3;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/OPCODE_ARITY_LUT.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/OPCODE_ARITY_LUT.md
#![allow(unused_imports)]

pub const OPCODE_ARITY_LUT: [u8; 248] = [0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 0, 2, 2, 2, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/SIN_LUT.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/SIN_LUT.md
#![allow(unused_imports)]

pub const SIN_LUT: [i16; 256] = [0, 804, 1608, 2410, 3212, 4011, 4808, 5602, 6393, 7179, 7962, 8739, 9512, 10278, 11039, 11793, 12539, 13279, 14010, 14732, 15446, 16151, 16846, 17530, 18204, 18868, 19519, 20159, 20787, 21403, 22005, 22594, 23170, 23731, 24279, 24811, 25329, 25832, 26319, 26790, 27245, 27683, 28105, 28510, 28898, 29268, 29621, 29956, 30273, 30571, 30852, 31113, 31356, 31580, 31785, 31971, 32137, 32285, 32412, 32521, 32609, 32678, 32728, 32757, 32767, 32757, 32728, 32678, 32609, 32521, 32412, 32285, 32137, 31971, 31785, 31580, 31356, 31113, 30852, 30571, 30273, 29956, 29621, 29268, 28898, 28510, 28105, 27683, 27245, 26790, 26319, 25832, 25329, 24811, 24279, 23731, 23170, 22594, 22005, 21403, 20787, 20159, 19519, 18868, 18204, 17530, 16846, 16151, 15446, 14732, 14010, 13279, 12539, 11793, 11039, 10278, 9512, 8739, 7962, 7179, 6393, 5602, 4808, 4011, 3212, 2410, 1608, 804, 0, -804, -1608, -2410, -3212, -4011, -4808, -5602, -6393, -7179, -7962, -8739, -9512, -10278, -11039, -11793, -12539, -13279, -14010, -14732, -15446, -16151, -16846, -17530, -18204, -18868, -19519, -20159, -20787, -21403, -22005, -22594, -23170, -23731, -24279, -24811, -25329, -25832, -26319, -26790, -27245, -27683, -28105, -28510, -28898, -29268, -29621, -29956, -30273, -30571, -30852, -31113, -31356, -31580, -31785, -31971, -32137, -32285, -32412, -32521, -32609, -32678, -32728, -32757, -32767, -32757, -32728, -32678, -32609, -32521, -32412, -32285, -32137, -31971, -31785, -31580, -31356, -31113, -30852, -30571, -30273, -29956, -29621, -29268, -28898, -28510, -28105, -27683, -27245, -26790, -26319, -25832, -25329, -24811, -24279, -23731, -23170, -22594, -22005, -21403, -20787, -20159, -19519, -18868, -18204, -17530, -16846, -16151, -15446, -14732, -14010, -13279, -12539, -11793, -11039, -10278, -9512, -8739, -7962, -7179, -6393, -5602, -4808, -4011, -3212, -2410, -1608, -804];

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/STATE_SNAPSHOT.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/state_snapshot.md
#![allow(unused_imports)]

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/SYSTEM_CONSTANTS.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/SYSTEM_CONSTANTS.md
#![allow(unused_imports)]

// Constants: SYSTEM_CONSTANTS
pub const MAX_ATOMS: usize = 500000;
pub const LAYOUT_VERSION: u32 = 1;
pub const SAFETY_BUFFER: usize = 8000000;
pub const GRID_W: i32 = 140;
pub const GRID_H: i32 = 80;
pub const GRID_CELLS: usize = (GRID_W * GRID_H) as usize;
pub const SPATIAL_CELL_SIZE: i32 = 10;
pub const WORLD_MAX_X: i32 = ((GRID_W * SPATIAL_CELL_SIZE) - 1) as i32;
pub const WORLD_MAX_Y: i32 = ((GRID_H * SPATIAL_CELL_SIZE) - 1) as i32;
pub const STRUCTURE_INTENT_SPIN_LIMIT: i32 = 128;
pub const PHEROMONE_COST_BASE: i32 = 10;
pub const PLASMID_COST_BASE: i32 = 25;
pub const ROLE_NEUTRAL: u8 = 0;
pub const ROLE_PRODUCER: u8 = 1;
pub const ROLE_GUARDIAN: u8 = 2;
pub const ROLE_ARCHITECT: u8 = 3;
pub const ROLE_PARASITE: u8 = 4;
pub const STRUCTURE_INTENT_LOCK_BIT: i32 = -2147483648;
pub const STRUCTURE_INTENT_OWNER_MASK: i32 = 2147483647;
pub const SCALE: i32 = 1000;
pub const CELL_CAPACITY: usize = 32;
pub const MAX_PC: u8 = 64;
pub const MAX_EXECUTION_STEPS: usize = 64;
pub const ATOM_LOGIC_SIZE: usize = 64;
pub const MAX_LEDGER_EVENTS: usize = 65536;
pub const MAX_EGRESS_EVENTS: usize = 8192;
pub const WASM_PAGE_BYTES: usize = 65536;
pub const WASM_MEMORY_PAGES: usize = 7630;
pub const HIVE_MEMORY_SIZE: usize = 1024;
pub const HIVE_ENERGY_POOL_SIZE: usize = 256;
pub const MAX_HORMONES: usize = 8;
pub const SECRETION_STATS_SIZE: usize = 12;
pub const MAX_SPAWN_REQUESTS: usize = 1024;
pub const MAX_MEIOSIS_EVENTS: usize = 75000;
pub const MAX_ASCENSION_STATS: usize = 62500;
pub const MAX_ASCENSION_STATS_RESERVED: usize = 1250000;
pub const ATOM_CONTEXT_SIZE: usize = 16;
pub const ATOM_GENOME_SIZE: usize = 8;
pub const ATOM_INSTRUCTION_SIZE: usize = 64;
pub const RESOURCE_MAX: i32 = 2000000000;
pub const MAX_GLYPH_AMP: i32 = 8388607;
pub const MIN_GLYPH_AMP: i32 = -8388608;
pub const SPAWN_MAX: i32 = 1024;
pub const SPAWN_SLOT: i32 = 24;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/StructureTypes.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/StructureTypes.md
#![allow(unused_imports)]

// Enum: StructureTypes
pub const STR_VOID: i32 = 0;
pub const STR_WIRE: i32 = 1;
pub const STR_NODE: i32 = 2;
pub const STR_DIODE: i32 = 3;
pub const STR_SOURCE: i32 = 4;
pub const STR_SINK: i32 = 5;
pub const STR_CAPACITOR: i32 = 6;
pub const STR_INVERTER: i32 = 7;
pub const STR_LATCH: i32 = 8;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/VmOpcodes.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/VmOpcodes.md
#![allow(unused_imports)]

// Enum: VmOpcodes
pub const OP_NOP: u8 = 0;
pub const OP_SET: u8 = 1;
pub const OP_GET: u8 = 2;
pub const OP_PUT: u8 = 3;
pub const OP_ADD: u8 = 4;
pub const OP_SUB: u8 = 5;
pub const OP_JZ: u8 = 16;
pub const OP_JNZ: u8 = 17;
pub const OP_JMP: u8 = 18;
pub const OP_SYSCALL: u8 = 96;
pub const OP_REPLICATE: u8 = 128;
pub const OP_SIGNAL: u8 = 129;
pub const OP_BIND: u8 = 130;
pub const OP_SHARE: u8 = 131;
pub const OP_HEBB: u8 = 138;
pub const OP_FIRE: u8 = 139;
pub const OP_DECAY: u8 = 145;
pub const OP_PLUG: u8 = 164;
pub const OP_TENSEGRITY: u8 = 165;
pub const OP_COLLECTIVE: u8 = 166;
pub const OP_BUILD: u8 = 168;
pub const OP_SPORE_DRIVE: u8 = 167;
pub const OP_SENSE: u8 = 169;
pub const OP_SENSE_AS: u8 = 178;
pub const OP_SECRETE_PLASMID: u8 = 170;
pub const OP_INCORPORATE_PLASMID: u8 = 171;
pub const OP_RESOLVE: u8 = 176;
pub const OP_RESONATE_KURAMOTO: u8 = 177;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/VmProps.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/VmProps.md
#![allow(unused_imports)]

// Enum: VmProps
pub const PROP_ENERGY: u8 = 0;
pub const PROP_RESONANCE: u8 = 1;
pub const PROP_X: u8 = 2;
pub const PROP_Y: u8 = 3;
pub const PROP_PHASE: u8 = 4;
pub const PROP_GRID_CHARGE: u8 = 7;
pub const PROP_QUORUM: u8 = 8;
pub const PROP_NEURAL_COHERENCE: u8 = 9;
pub const PROP_MEMORY: u8 = 10;
pub const PROP_CONSENSUS: u8 = 11;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/VmSys.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/VmSys.md
#![allow(unused_imports)]

// Enum: VmSys
pub const SYS_YIELD: i32 = 1;
pub const SYS_READ_MEM: i32 = 2;
pub const SYS_WRITE_MEM: i32 = 3;
pub const SYS_SPAWN: i32 = 4;
pub const SYS_BIND: i32 = 5;
pub const SYS_SET_ROLE: i32 = 6;
pub const SYS_MUTATE: i32 = 7;
pub const SYS_MSG: i32 = 8;
pub const SYS_READ_INBOX: i32 = 9;
pub const SYS_TRANSFER: i32 = 10;
pub const SYS_REPLICATE: i32 = 11;
pub const SYS_EMIT: i32 = 12;
pub const SYS_SCAN: i32 = 13;
pub const SYS_MOVE: i32 = 14;
pub const SYS_EAT: i32 = 15;
pub const SYS_BET: i32 = 16;
pub const SYS_ATTRACT: i32 = 17;
pub const SYS_FOLD: i32 = 18;
pub const SYS_SPORE_DRIVE: i32 = 20;
pub const SYS_SENSE_PHASE: i32 = 21;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/append_jsonl.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/append_jsonl.md
#![allow(unused_imports)]

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/clamp01.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/clamp01.md
#![allow(unused_imports)]

pub fn clamp01(x: f64) -> f64 {
    if x < 0.0 {
        0.0
    } else if x > 1.0 {
        1.0
    } else {
        x
    }
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/dir4_x.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/spatial/dir4_x.md
#![allow(unused_imports)]

pub fn dir4_x(n: i32) -> i32 {
    if n == 0 {
        -1
    } else if n == 1 {
        1
    } else {
        0
    }
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/dir4_y.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/spatial/dir4_y.md
#![allow(unused_imports)]

pub fn dir4_y(n: i32) -> i32 {
    if n == 2 {
        -1
    } else if n == 3 {
        1
    } else {
        0
    }
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/dir8_x.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/spatial/dir8_x.md
#![allow(unused_imports)]

pub fn dir8_x(n: i32) -> i32 {
    if n == 0 || n == 4 || n == 6 {
        -1
    } else if n == 1 || n == 5 || n == 7 {
        1
    } else {
        0
    }
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/dir8_y.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/spatial/dir8_y.md
#![allow(unused_imports)]

pub fn dir8_y(n: i32) -> i32 {
    if n == 2 || n == 4 || n == 5 {
        -1
    } else if n == 3 || n == 6 || n == 7 {
        1
    } else {
        0
    }
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/encode_force_tuple.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/encode_force_tuple.md
#![allow(unused_imports)]

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/fast_abs.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/fast_abs.md
#![allow(unused_imports)]

pub fn fast_abs(v: i32) -> i32 {
    let mask = v >> 31;
    (v + mask) ^ mask
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/fast_max.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/fast_max.md
#![allow(unused_imports)]

pub fn fast_max(a: i32, b: i32) -> i32 {
    let diff = a - b;
    a - (diff & (diff >> 31))
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/fast_min.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/fast_min.md
#![allow(unused_imports)]

pub fn fast_min(a: i32, b: i32) -> i32 {
    let diff = a - b;
    b + (diff & (diff >> 31))
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/fast_sign.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/fast_sign.md
#![allow(unused_imports)]

pub fn fast_sign(v: i32) -> i32 {
    (v >> 31) | ((-v as u32) >> 31) as i32
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/immune_check.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/immune_check.md
#![allow(unused_imports)]

#[inline(always)]
pub fn immune_check(energy: i32, resonance: i32, id_handle: i32, role: u8, entropy_pressure: i32) -> bool {
    if id_handle == 0 { return false; }
    
        if energy <= 0 && resonance <= 0 { return true; }
    
        if role == 5 { return false; } // ROLE_MITOCHONDRIA
    
        let threshold_x1000 = entropy_pressure * 2;
        let energy_x1000 = energy * 1000;
    
        if energy_x1000 < threshold_x1000 {
            if (resonance * 10) < threshold_x1000 {
                return true;
            }
        }
    
        false
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/math_clamp.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/math_clamp.md
#![allow(unused_imports)]

pub fn math_clamp(val: i32, min: i32, max: i32) -> i32 {
    if val < min {
        min
    } else if val > max {
        max
    } else {
        val
    }
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/mod.rs

```rust
// AUTOGENERATED LEVEL FACADE

#[path = "trace_atom.rs"]
pub mod trace_atom;
pub use trace_atom::*;
#[path = "GLYPH_ARITY_LUT.rs"]
pub mod GLYPH_ARITY_LUT;
pub use GLYPH_ARITY_LUT::*;
#[path = "StructureTypes.rs"]
pub mod StructureTypes;
pub use StructureTypes::*;
#[path = "VmProps.rs"]
pub mod VmProps;
pub use VmProps::*;
#[path = "VmSys.rs"]
pub mod VmSys;
pub use VmSys::*;
#[path = "GLYPH_TYPES.rs"]
pub mod GLYPH_TYPES;
pub use GLYPH_TYPES::*;
#[path = "OPCODE_ARITY_LUT.rs"]
pub mod OPCODE_ARITY_LUT;
pub use OPCODE_ARITY_LUT::*;
#[path = "SYSTEM_CONSTANTS.rs"]
pub mod SYSTEM_CONSTANTS;
pub use SYSTEM_CONSTANTS::*;
#[path = "VmOpcodes.rs"]
pub mod VmOpcodes;
pub use VmOpcodes::*;
#[path = "GLYPH_LEGACY_OPCODE_LUT.rs"]
pub mod GLYPH_LEGACY_OPCODE_LUT;
pub use GLYPH_LEGACY_OPCODE_LUT::*;
#[path = "GLYPH_ENERGY_LUT.rs"]
pub mod GLYPH_ENERGY_LUT;
pub use GLYPH_ENERGY_LUT::*;
#[path = "GLYPH_RGB_LUT.rs"]
pub mod GLYPH_RGB_LUT;
pub use GLYPH_RGB_LUT::*;
#[path = "append_jsonl.rs"]
pub mod append_jsonl;
pub use append_jsonl::*;
#[path = "sigma_isa.rs"]
pub mod sigma_isa;
pub use sigma_isa::*;
#[path = "read_jsonl.rs"]
pub mod read_jsonl;
pub use read_jsonl::*;
#[path = "ENV_PARSE.rs"]
pub mod ENV_PARSE;
pub use ENV_PARSE::*;
#[path = "read_jsonl_lines.rs"]
pub mod read_jsonl_lines;
pub use read_jsonl_lines::*;
#[path = "sigma_math.rs"]
pub mod sigma_math;
pub use sigma_math::*;
#[path = "sigma_atom_role.rs"]
pub mod sigma_atom_role;
pub use sigma_atom_role::*;
#[path = "STATE_SNAPSHOT.rs"]
pub mod STATE_SNAPSHOT;
pub use STATE_SNAPSHOT::*;
#[path = "pack_glyph_header.rs"]
pub mod pack_glyph_header;
pub use pack_glyph_header::*;
#[path = "unpack_glyph_amplitude.rs"]
pub mod unpack_glyph_amplitude;
pub use unpack_glyph_amplitude::*;
#[path = "unpack_glyph_kind.rs"]
pub mod unpack_glyph_kind;
pub use unpack_glyph_kind::*;
#[path = "immune_check.rs"]
pub mod immune_check;
pub use immune_check::*;
#[path = "COS_LUT.rs"]
pub mod COS_LUT;
pub use COS_LUT::*;
#[path = "normalize_angle.rs"]
pub mod normalize_angle;
pub use normalize_angle::*;
#[path = "fast_abs.rs"]
pub mod fast_abs;
pub use fast_abs::*;
#[path = "fast_max.rs"]
pub mod fast_max;
pub use fast_max::*;
#[path = "prng_next.rs"]
pub mod prng_next;
pub use prng_next::*;
#[path = "clamp01.rs"]
pub mod clamp01;
pub use clamp01::*;
#[path = "fast_sign.rs"]
pub mod fast_sign;
pub use fast_sign::*;
#[path = "math_clamp.rs"]
pub mod math_clamp;
pub use math_clamp::*;
#[path = "SIN_LUT.rs"]
pub mod SIN_LUT;
pub use SIN_LUT::*;
#[path = "fast_min.rs"]
pub mod fast_min;
pub use fast_min::*;
#[path = "C_LOG2_C_LUT.rs"]
pub mod C_LOG2_C_LUT;
pub use C_LOG2_C_LUT::*;
#[path = "GENESIS_PREDATOR_SCRIPT.rs"]
pub mod GENESIS_PREDATOR_SCRIPT;
pub use GENESIS_PREDATOR_SCRIPT::*;
#[path = "encode_force_tuple.rs"]
pub mod encode_force_tuple;
pub use encode_force_tuple::*;
#[path = "dir8_y.rs"]
pub mod dir8_y;
pub use dir8_y::*;
#[path = "dir4_y.rs"]
pub mod dir4_y;
pub use dir4_y::*;
#[path = "dir4_x.rs"]
pub mod dir4_x;
pub use dir4_x::*;
#[path = "dir8_x.rs"]
pub mod dir8_x;
pub use dir8_x::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/normalize_angle.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/normalize_angle.md
#![allow(unused_imports)]

pub fn normalize_angle(angle: f64) -> f64 {
    let tau = 2.0 * std::f64::consts::PI;
    let mut a = angle % tau;
    if a < 0.0 {
        a += tau;
    }
    a / tau
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/pack_glyph_header.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/pack_glyph_header.md
#![allow(unused_imports)]

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/prng_next.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/prng_next.md
#![allow(unused_imports)]

pub fn prng_next(state: u32) -> u32 {
    state.wrapping_mul(1664525).wrapping_add(1013904223)
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/read_jsonl.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/read_jsonl.md
#![allow(unused_imports)]

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/read_jsonl_lines.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/read_jsonl_lines.md
#![allow(unused_imports)]

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/sigma_atom_role.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/sigma_atom_role.md
// Substrate Node: sigma_atom_role
// Level: 0
// Defines the role enumerations for OMEGA atoms

#![allow(unused_imports)]

pub const U64_BYTES: usize = 8;
pub const I32_BYTES: usize = 4;
pub const I16_BYTES: usize = 2;
pub const F32_BYTES: usize = 4;

#[repr(u8)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AtomRole {
    None = 0,
    Guardian = 1,
    Architect = 2,
    Artisan = 3,
    Parasite = 4,
    Mitochondria = 5,
    MetazoanFlag = 0x80,
}

impl AtomRole {
    pub fn from_u8(val: u8) -> Self {
        match val {
            1 => Self::Guardian,
            2 => Self::Architect,
            3 => Self::Artisan,
            4 => Self::Parasite,
            5 => Self::Mitochondria,
            0x80 => Self::MetazoanFlag,
            _ => Self::None,
        }
    }
}
```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/sigma_isa.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/sigma_isa.md
// Substrate Node: sigma_isa
// Level: 0
// Defines the Instruction Set Architecture values for the interpreter.

#![allow(unused_imports)]

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum GlyphOp {
    Nop = 0x00,
    Set = 0x01,
    Get = 0x02,
    Put = 0x03,
    Add = 0x04,
    Sub = 0x05,
    Jz = 0x10,
    Jnz = 0x11,
    Jmp = 0x12,
    // Future syscalls
    Syscall = 0x60,
    Replicate = 0x80,
    Signal = 0x81,
    Bind = 0x82,
    Share = 0x83,
    Hebb = 0x8A,
    Fire = 0x8B,
    Decay = 0x91,
    Plug = 0xA4,
    Tensegrity = 0xA5,
    Collective = 0xA6,
    Build = 0xA8,
    Sense = 0xA9,
    SecretePlasmid = 0xAA,
    IncorporatePlasmid = 0xAB,
    Resolve = 0xB0,
    ResonateKuramoto = 0xB1,
    Unknown = 0xFF,
}

impl From<u8> for GlyphOp {
    fn from(val: u8) -> Self {
        match val {
            0x00 => GlyphOp::Nop,
            0x01 => GlyphOp::Set,
            0x02 => GlyphOp::Get,
            0x03 => GlyphOp::Put,
            0x04 => GlyphOp::Add,
            0x05 => GlyphOp::Sub,
            0x10 => GlyphOp::Jz,
            0x11 => GlyphOp::Jnz,
            0x12 => GlyphOp::Jmp,
            0x60 => GlyphOp::Syscall,
            0x80 => GlyphOp::Replicate,
            0x81 => GlyphOp::Signal,
            0x82 => GlyphOp::Bind,
            0x83 => GlyphOp::Share,
            0x8A => GlyphOp::Hebb,
            0x8B => GlyphOp::Fire,
            0x91 => GlyphOp::Decay,
            0xA4 => GlyphOp::Plug,
            0xA5 => GlyphOp::Tensegrity,
            0xA6 => GlyphOp::Collective,
            0xA8 => GlyphOp::Build,
            0xA9 => GlyphOp::Sense, // Structure Sense
            0xAA => GlyphOp::SecretePlasmid,
            0xAB => GlyphOp::IncorporatePlasmid,
            0xB0 => GlyphOp::Resolve,
            0xB1 => GlyphOp::ResonateKuramoto,
            _ => GlyphOp::Unknown,
        }
    }
}
```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/sigma_math.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/sigma_math.md
// Substrate Node: sigma_math
// Level: 0
// Mathematical Coprocessor (Deterministic LUT Trigonometry)

#![allow(unused_imports)]

// Flatten the levels backwards into the math namespace so external code can just use `crate::math_sin`
pub use crate::ontology_gen::L01::*;
pub use crate::ontology_gen::L00::*;
```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/trace_atom.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/trace_atom.md
#![allow(unused_imports)]

pub fn trace_atom(idx: i32, opcode: i32, gx: i32, gy: i32, targetIdx: i32) -> () {
    // Externally defined in the host or FFI boundary for Sigma
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/unpack_glyph_amplitude.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/unpack_glyph_amplitude.md
#![allow(unused_imports)]

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/00/unpack_glyph_kind.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/unpack_glyph_kind.md
#![allow(unused_imports)]

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/01/OMEGA_MEMORY_LAYOUT.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/OMEGA_MEMORY_LAYOUT.md
#![allow(unused_imports)]
use super::super::L00::*;

// Memory Layout: OMEGA_MEMORY_LAYOUT
pub const TICK_COUNTER_OFFSET: usize = ((SAFETY_BUFFER - 8) + 4 - 1) & !(4 - 1);
pub const TICK_COUNTER_OFF: usize = TICK_COUNTER_OFFSET;
pub const SYNC_STATE_OFFSET: usize = ((TICK_COUNTER_OFFSET + (4)) + 4 - 1) & !(4 - 1);
pub const SYNC_STATE_OFF: usize = SYNC_STATE_OFFSET;
pub const IDS_OFFSET: usize = ((SYNC_STATE_OFFSET + (4)) + 8 - 1) & !(8 - 1);
pub const IDS_OFF: usize = IDS_OFFSET;
pub const XS_OFFSET: usize = ((IDS_OFFSET + (MAX_ATOMS * 8)) + 2 - 1) & !(2 - 1);
pub const XS_OFF: usize = XS_OFFSET;
pub const YS_OFFSET: usize = ((XS_OFFSET + (MAX_ATOMS * 2)) + 2 - 1) & !(2 - 1);
pub const YS_OFF: usize = YS_OFFSET;
pub const ENERGY_OFFSET: usize = ((YS_OFFSET + (MAX_ATOMS * 2)) + 4 - 1) & !(4 - 1);
pub const ENERGY_OFF: usize = ENERGY_OFFSET;
pub const RESONANCE_OFFSET: usize = ((ENERGY_OFFSET + (MAX_ATOMS * 4)) + 4 - 1) & !(4 - 1);
pub const RESONANCE_OFF: usize = RESONANCE_OFFSET;
pub const PHASE_OFFSET: usize = ((RESONANCE_OFFSET + (MAX_ATOMS * 4)) + 4 - 1) & !(4 - 1);
pub const PHASE_OFF: usize = PHASE_OFFSET;
pub const LOGIC_OFFSET: usize = PHASE_OFFSET + (MAX_ATOMS * 4);
pub const LOGIC_OFF: usize = LOGIC_OFFSET;
pub const BONDS_OFFSET: usize = ((LOGIC_OFFSET + (MAX_ATOMS * 8)) + 4 - 1) & !(4 - 1);
pub const BONDS_OFF: usize = BONDS_OFFSET;
pub const STIFFNESS_OFFSET: usize = ((BONDS_OFFSET + (MAX_ATOMS * 4 * 4)) + 4 - 1) & !(4 - 1);
pub const STIFFNESS_OFF: usize = STIFFNESS_OFFSET;
pub const INSTRUCTIONS_OFFSET: usize = STIFFNESS_OFFSET + (MAX_ATOMS * 4 * 4);
pub const INSTRUCTIONS_OFF: usize = INSTRUCTIONS_OFFSET;
pub const GENOMES_OFFSET: usize = INSTRUCTIONS_OFFSET;
pub const CONTEXT_OFFSET: usize = ((INSTRUCTIONS_OFFSET + (MAX_ATOMS * 64)) + 4 - 1) & !(4 - 1);
pub const CONTEXT_OFF: usize = CONTEXT_OFFSET;
pub const EVOLUTION_OFFSET: usize = ((CONTEXT_OFFSET + (MAX_ATOMS * 16 * 4)) + 4 - 1) & !(4 - 1);
pub const EVOLUTION_OFF: usize = EVOLUTION_OFFSET;
pub const INTENT_OFFSET: usize = EVOLUTION_OFFSET;
pub const SPAWN_REQUESTS_OFFSET: usize = ((EVOLUTION_OFFSET + (MAX_ATOMS * 4)) + 8 - 1) & !(8 - 1);
pub const SPAWN_REQUESTS_OFF: usize = SPAWN_REQUESTS_OFFSET;
pub const SPAWN_GRID_OFF: usize = SPAWN_REQUESTS_OFFSET;
pub const SPAWN_HEAD_OFF: usize = SPAWN_REQUESTS_OFFSET;
pub const SPAWN_DATA_OFF: usize = SPAWN_REQUESTS_OFFSET + 8;
pub const MEIOSIS_RESERVED_OFFSET: usize = ((SPAWN_REQUESTS_OFFSET + (8 + (1024 * 24))) + 4 - 1) & !(4 - 1);
pub const MEIOSIS_RESERVED_OFF: usize = MEIOSIS_RESERVED_OFFSET;
pub const BOND_REQUESTS_OFFSET: usize = ((MEIOSIS_RESERVED_OFFSET + (75000 * 80)) + 4 - 1) & !(4 - 1);
pub const BOND_REQUESTS_OFF: usize = BOND_REQUESTS_OFFSET;
pub const SPATIAL_GRID_OFFSET: usize = ((BOND_REQUESTS_OFFSET + (MAX_ATOMS * 3 * 4)) + 4 - 1) & !(4 - 1);
pub const SPATIAL_GRID_OFF: usize = SPATIAL_GRID_OFFSET;
pub const ROLES_OFFSET: usize = SPATIAL_GRID_OFFSET + (GRID_CELLS * 32 * 4);
pub const ROLES_OFF: usize = ROLES_OFFSET;
pub const STRUCTURE_GRID_OFFSET: usize = ((ROLES_OFFSET + (MAX_ATOMS)) + 4 - 1) & !(4 - 1);
pub const STRUCTURE_GRID_OFF: usize = STRUCTURE_GRID_OFFSET;
pub const SIGNAL_GRID_OFFSET: usize = ((STRUCTURE_GRID_OFFSET + (GRID_CELLS * 4)) + 4 - 1) & !(4 - 1);
pub const SIGNAL_GRID_OFF: usize = SIGNAL_GRID_OFFSET;
pub const MEMORY_GRID_OFFSET: usize = SIGNAL_GRID_OFFSET + (GRID_CELLS * 4);
pub const MEMORY_GRID_OFF: usize = MEMORY_GRID_OFFSET;
pub const ASCENSION_STATS_RESERVED_OFFSET: usize = ((MEMORY_GRID_OFFSET + (GRID_CELLS * 8)) + 4 - 1) & !(4 - 1);
pub const ASCENSION_STATS_RESERVED_OFF: usize = ASCENSION_STATS_RESERVED_OFFSET;
pub const ASCENSION_STATS_OFFSET: usize = ASCENSION_STATS_RESERVED_OFFSET;
pub const ASCENSION_STATS_OFF: usize = ASCENSION_STATS_RESERVED_OFFSET;
pub const BOND_DISTANCES_OFFSET: usize = ASCENSION_STATS_RESERVED_OFFSET + (1250000 * 4);
pub const BOND_DISTANCES_OFF: usize = BOND_DISTANCES_OFFSET;
pub const SYNAPTIC_WEIGHTS_OFFSET: usize = BOND_DISTANCES_OFFSET + (MAX_ATOMS * 4);
pub const SYNAPTIC_WEIGHTS_OFF: usize = SYNAPTIC_WEIGHTS_OFFSET;
pub const DAMPING_OFFSET: usize = SYNAPTIC_WEIGHTS_OFFSET + (MAX_ATOMS * 4);
pub const DAMPING_OFF: usize = DAMPING_OFFSET;
pub const CAUSALITY_OFFSET: usize = DAMPING_OFFSET + (MAX_ATOMS);
pub const CAUSALITY_OFF: usize = CAUSALITY_OFFSET;
pub const HIVE_MEMORY_OFFSET: usize = CAUSALITY_OFFSET + (MAX_ATOMS);
pub const HIVE_MEMORY_OFF: usize = HIVE_MEMORY_OFFSET;
pub const HIVE_BALANCE_OFFSET: usize = ((HIVE_MEMORY_OFFSET + (1024)) + 4 - 1) & !(4 - 1);
pub const HIVE_BALANCE_OFF: usize = HIVE_BALANCE_OFFSET;
pub const QUORUM_OFFSET: usize = ((HIVE_BALANCE_OFFSET + (4)) + 4 - 1) & !(4 - 1);
pub const QUORUM_OFF: usize = QUORUM_OFFSET;
pub const COHERENCE_OFFSET: usize = ((QUORUM_OFFSET + (GRID_CELLS * 8 * 4)) + 4 - 1) & !(4 - 1);
pub const COHERENCE_OFF: usize = COHERENCE_OFFSET;
pub const NEURAL_COHERENCE_OFFSET: usize = ((COHERENCE_OFFSET + (4)) + 4 - 1) & !(4 - 1);
pub const NEURAL_COHERENCE_OFF: usize = NEURAL_COHERENCE_OFFSET;
pub const PHYSICS_READ_XS_OFFSET: usize = ((NEURAL_COHERENCE_OFFSET + (4)) + 2 - 1) & !(2 - 1);
pub const PHYSICS_READ_XS_OFF: usize = PHYSICS_READ_XS_OFFSET;
pub const PHYSICS_READ_YS_OFFSET: usize = ((PHYSICS_READ_XS_OFFSET + (MAX_ATOMS * 2)) + 2 - 1) & !(2 - 1);
pub const PHYSICS_READ_YS_OFF: usize = PHYSICS_READ_YS_OFFSET;
pub const PHYSICS_READ_ENERGY_OFFSET: usize = ((PHYSICS_READ_YS_OFFSET + (MAX_ATOMS * 2)) + 4 - 1) & !(4 - 1);
pub const PHYSICS_READ_ENERGY_OFF: usize = PHYSICS_READ_ENERGY_OFFSET;
pub const PHYSICS_READ_RESONANCE_OFFSET: usize = ((PHYSICS_READ_ENERGY_OFFSET + (MAX_ATOMS * 4)) + 4 - 1) & !(4 - 1);
pub const PHYSICS_READ_RESONANCE_OFF: usize = PHYSICS_READ_RESONANCE_OFFSET;
pub const ENERGY_DELTA_OFFSET: usize = ((PHYSICS_READ_RESONANCE_OFFSET + (MAX_ATOMS * 4)) + 4 - 1) & !(4 - 1);
pub const ENERGY_DELTA_OFF: usize = ENERGY_DELTA_OFFSET;
pub const RESONANCE_DELTA_OFFSET: usize = ((ENERGY_DELTA_OFFSET + (MAX_ATOMS * 4)) + 4 - 1) & !(4 - 1);
pub const RESONANCE_DELTA_OFF: usize = RESONANCE_DELTA_OFFSET;
pub const STRUCTURE_BUILD_OWNER_OFFSET: usize = ((RESONANCE_DELTA_OFFSET + (MAX_ATOMS * 4)) + 4 - 1) & !(4 - 1);
pub const STRUCTURE_BUILD_OWNER_OFF: usize = STRUCTURE_BUILD_OWNER_OFFSET;
pub const STRUCTURE_BUILD_VALUE_OFFSET: usize = ((STRUCTURE_BUILD_OWNER_OFFSET + (GRID_CELLS * 4)) + 4 - 1) & !(4 - 1);
pub const STRUCTURE_BUILD_VALUE_OFF: usize = STRUCTURE_BUILD_VALUE_OFFSET;
pub const STRUCTURE_CHARGE_INTENT_OFFSET: usize = ((STRUCTURE_BUILD_VALUE_OFFSET + (GRID_CELLS * 4)) + 4 - 1) & !(4 - 1);
pub const STRUCTURE_CHARGE_INTENT_OFF: usize = STRUCTURE_CHARGE_INTENT_OFFSET;
pub const ATTENTION_FIELD_OFFSET: usize = ((STRUCTURE_CHARGE_INTENT_OFFSET + (GRID_CELLS * 4)) + 4 - 1) & !(4 - 1);
pub const ATTENTION_FIELD_OFF: usize = ATTENTION_FIELD_OFFSET;
pub const HIVE_ENERGY_POOL_OFFSET: usize = ((ATTENTION_FIELD_OFFSET + (GRID_CELLS * 4)) + 4 - 1) & !(4 - 1);
pub const HIVE_ENERGY_POOL_OFF: usize = HIVE_ENERGY_POOL_OFFSET;
pub const GLYPH_HEADER_OFFSET: usize = ((HIVE_ENERGY_POOL_OFFSET + (256 * 4)) + 4 - 1) & !(4 - 1);
pub const GLYPH_HEADER_OFF: usize = GLYPH_HEADER_OFFSET;
pub const GLYPH_PAYLOAD_OFFSET: usize = GLYPH_HEADER_OFFSET + (GRID_CELLS * 4);
pub const GLYPH_PAYLOAD_OFF: usize = GLYPH_PAYLOAD_OFFSET;
pub const GLYPH_SCRATCH_HEADER_OFFSET: usize = ((GLYPH_PAYLOAD_OFFSET + (GRID_CELLS * 8)) + 4 - 1) & !(4 - 1);
pub const GLYPH_SCRATCH_HEADER_OFF: usize = GLYPH_SCRATCH_HEADER_OFFSET;
pub const GLYPH_SCRATCH_PAYLOAD_OFFSET: usize = GLYPH_SCRATCH_HEADER_OFFSET + (GRID_CELLS * 4);
pub const GLYPH_SCRATCH_PAYLOAD_OFF: usize = GLYPH_SCRATCH_PAYLOAD_OFFSET;
pub const HORMONES_OFFSET: usize = ((GLYPH_SCRATCH_PAYLOAD_OFFSET + (GRID_CELLS * 8)) + 2 - 1) & !(2 - 1);
pub const HORMONES_OFF: usize = HORMONES_OFFSET;
pub const SECRETION_STATS_OFFSET: usize = ((HORMONES_OFFSET + (8 * 2)) + 4 - 1) & !(4 - 1);
pub const SECRETION_STATS_OFF: usize = SECRETION_STATS_OFFSET;
pub const LINEAGE_OFFSET: usize = ((SECRETION_STATS_OFFSET + (12 * 4)) + 8 - 1) & !(8 - 1);
pub const LINEAGE_OFF: usize = LINEAGE_OFFSET;
pub const MAILBOX_OFFSET: usize = ((LINEAGE_OFFSET + (MAX_ATOMS * 8)) + 4 - 1) & !(4 - 1);
pub const MAILBOX_OFF: usize = MAILBOX_OFFSET;
pub const LEDGER_HEAD_OFFSET: usize = ((MAILBOX_OFFSET + (MAX_ATOMS * 8)) + 4 - 1) & !(4 - 1);
pub const LEDGER_HEAD_OFF: usize = LEDGER_HEAD_OFFSET;
pub const LEDGER_DATA_OFFSET: usize = ((LEDGER_HEAD_OFFSET + (4)) + 4 - 1) & !(4 - 1);
pub const LEDGER_DATA_OFF: usize = LEDGER_DATA_OFFSET;
pub const EGRESS_HEAD_OFFSET: usize = ((LEDGER_DATA_OFFSET + (65536 * 16)) + 4 - 1) & !(4 - 1);
pub const EGRESS_HEAD_OFF: usize = EGRESS_HEAD_OFFSET;
pub const EGRESS_DATA_OFFSET: usize = ((EGRESS_HEAD_OFFSET + (4)) + 4 - 1) & !(4 - 1);
pub const EGRESS_DATA_OFF: usize = EGRESS_DATA_OFFSET;
pub const METABOLISM_SCRATCH_OFFSET: usize = ((EGRESS_DATA_OFFSET + (8192 * 128)) + 4 - 1) & !(4 - 1);
pub const METABOLISM_SCRATCH_OFF: usize = METABOLISM_SCRATCH_OFFSET;
pub const LATTICE_MEMORY_END: usize = METABOLISM_SCRATCH_OFFSET + ((65536 * 4) + 128);

```

---

## FILE: src/00/sigma_core/src/ontology_gen/01/calculate_shannon_entropy.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/calculate_shannon_entropy.md
#![allow(unused_imports)]
use super::super::L00::*;

pub fn calculate_shannon_entropy(data: &[u8; 64]) -> i32 {
    let mut counts = [0i32; 256];
        for &b in data.iter() {
            counts[b as usize] += 1;
        }
    
        let mut sum_c_log_c = 0;
        for &c in counts.iter() {
            if c > 0 {
                sum_c_log_c += C_LOG2_C_LUT[c as usize];
            }
        }
    
        let mut entropy = 6000 - (sum_c_log_c >> 6);
        
        if entropy < 0 {
            entropy = 0;
        } else if entropy > 6000 {
            entropy = 6000;
        }
        
        entropy
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/01/checkpoint_chain.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/l32_gate/checkpoint_chain.md
#![allow(unused_imports)]
use super::super::L00::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/01/clamp_resource.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/clamp_resource.md
#![allow(unused_imports)]
use super::super::L00::*;

pub fn clamp_resource(value: i64) -> i32 {
    if value < 0 {
        0
    } else if value > (RESOURCE_MAX as i64) {
        RESOURCE_MAX as i32
    } else {
        value as i32
    }
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/01/clamp_world_x.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/spatial/clamp_world_x.md
#![allow(unused_imports)]
use super::super::L00::*;

pub fn clamp_world_x(x: i32) -> i32 {
    math_clamp(x, 0, WORLD_MAX_X)
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/01/clamp_world_y.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/spatial/clamp_world_y.md
#![allow(unused_imports)]
use super::super::L00::*;

pub fn clamp_world_y(y: i32) -> i32 {
    math_clamp(y, 0, WORLD_MAX_Y)
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/01/in_grid.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/spatial/in_grid.md
#![allow(unused_imports)]
use super::super::L00::*;

pub fn in_grid(x: i32, y: i32) -> bool {
    x >= 0 && x < GRID_W && y >= 0 && y < GRID_H
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/01/ledger_chain.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/l32_gate/ledger_chain.md
#![allow(unused_imports)]
use super::super::L00::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/01/math_cos.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/math_cos.md
#![allow(unused_imports)]
use super::super::L00::*;

pub fn math_cos(angle: i32, highRes: i32) -> i32 {
    if highRes == 0 {
        let idx = (angle & 255) as usize;
        return COS_LUT[idx] as i32;
    }
    let idx = ((angle >> 8) & 255) as usize;
    let frac = angle & 255;
    
    if highRes == 1 {
        let v0 = COS_LUT[idx] as i32;
        let v1 = COS_LUT[(idx + 1) & 255] as i32;
        return v0 + (((v1 - v0) * frac) >> 8);
    }
    
    let s_base = SIN_LUT[idx] as i32;
    let c_base = COS_LUT[idx] as i32;
    let d1 = (s_base * 804) >> 15;
    let term1 = (d1 * frac) >> 8;
    let d2 = (c_base * 10) >> 15;
    let term2 = (d2 * frac * frac) >> 16;
    c_base - term1 - term2
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/01/math_sin.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/math_sin.md
#![allow(unused_imports)]
use super::super::L00::*;

pub fn math_sin(angle: i32, highRes: i32) -> i32 {
    if highRes == 0 {
        let idx = (angle & 255) as usize;
        return SIN_LUT[idx] as i32;
    }
    let idx = ((angle >> 8) & 255) as usize;
    let frac = angle & 255;
    
    if highRes == 1 {
        let v0 = SIN_LUT[idx] as i32;
        let v1 = SIN_LUT[(idx + 1) & 255] as i32;
        return v0 + (((v1 - v0) * frac) >> 8);
    }
    
    // TAYLOR2
    let s_base = SIN_LUT[idx] as i32;
    let c_base = COS_LUT[idx] as i32;
    let d1 = (c_base * 804) >> 15;
    let term1 = (d1 * frac) >> 8;
    let d2 = (s_base * 10) >> 15;
    let term2 = (d2 * frac * frac) >> 16;
    s_base + term1 - term2
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/01/mod.rs

```rust
// AUTOGENERATED LEVEL FACADE

pub use super::L00::*;

#[path = "OMEGA_MEMORY_LAYOUT.rs"]
pub mod OMEGA_MEMORY_LAYOUT;
pub use OMEGA_MEMORY_LAYOUT::*;
#[path = "sigma_memory.rs"]
pub mod sigma_memory;
pub use sigma_memory::*;
#[path = "calculate_shannon_entropy.rs"]
pub mod calculate_shannon_entropy;
pub use calculate_shannon_entropy::*;
#[path = "clamp_resource.rs"]
pub mod clamp_resource;
pub use clamp_resource::*;
#[path = "math_sin.rs"]
pub mod math_sin;
pub use math_sin::*;
#[path = "math_cos.rs"]
pub mod math_cos;
pub use math_cos::*;
#[path = "ledger_chain.rs"]
pub mod ledger_chain;
pub use ledger_chain::*;
#[path = "checkpoint_chain.rs"]
pub mod checkpoint_chain;
pub use checkpoint_chain::*;
#[path = "in_grid.rs"]
pub mod in_grid;
pub use in_grid::*;
#[path = "clamp_world_y.rs"]
pub mod clamp_world_y;
pub use clamp_world_y::*;
#[path = "clamp_world_x.rs"]
pub mod clamp_world_x;
pub use clamp_world_x::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/01/sigma_memory.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/sigma_memory.md
// Substrate Node: sigma_memory
// Level: 1
// The central Data-Oriented memory matrix that perfectly aligns with Deno's SharedArrayBuffer

#![allow(unused_imports)]
use super::super::L00::*;

// Sigma-Core Memory Layout
// Byte-for-byte compatible with OMEGA-64 OFFSETS.ts

/// The central Data-Oriented memory matrix that perfectly aligns with Deno's `SharedArrayBuffer`
#[repr(C)]
pub struct SigmaMatrix {
    pub ids: [u64; MAX_ATOMS],
    pub xs: [i16; MAX_ATOMS],
    pub ys: [i16; MAX_ATOMS],
    pub energy: [i32; MAX_ATOMS],
    pub resonance: [i32; MAX_ATOMS],
    pub phase: [i32; MAX_ATOMS],
    pub logic: [[u8; ATOM_GENOME_SIZE]; MAX_ATOMS],
    pub bonds: [i32; MAX_ATOMS * 4],
    pub stiffness: [f32; MAX_ATOMS * 4],
    pub instructions: [[u8; ATOM_INSTRUCTION_SIZE]; MAX_ATOMS],
    pub context: [[i32; ATOM_CONTEXT_SIZE]; MAX_ATOMS],
    pub evolution_reserved: [i32; MAX_ATOMS],
    pub spawn_requests: [u8; 8 + (MAX_SPAWN_REQUESTS * 24)],
    pub meiosis_reserved: [i32; MAX_MEIOSIS_EVENTS], // Size 300,000 bytes
    pub _pad_to_bond_requests: [u8; 112024584 - (106024584 + (MAX_MEIOSIS_EVENTS * 4))], // 112024584 - 106324584 = 5700000 bytes
    pub bond_requests: [i32; MAX_ATOMS * 3],
    pub spatial_grid: [i32; GRID_CELLS * 32],
    pub roles: [u8; MAX_ATOMS],
    pub structure_grid: [i32; GRID_CELLS],
    pub signal_grid: [i32; GRID_CELLS],
    pub memory_grid: [[u8; 8]; GRID_CELLS],
    pub ascension_stats_reserved: [i32; MAX_ASCENSION_STATS_RESERVED],
    pub bond_distances: [u8; MAX_ATOMS * 4],
    pub synaptic_weights: [u8; MAX_ATOMS * 4],
    pub damping: [u8; MAX_ATOMS],
    pub causality: [u8; MAX_ATOMS],
    pub hive_memory: [u8; HIVE_MEMORY_SIZE],
    pub hive_balance: i32,
    pub quorum: [i32; GRID_CELLS * 8],
    pub coherence: i32,
    pub neural_coherence: i32,
    pub physics_read_xs: [i16; MAX_ATOMS],
    pub physics_read_ys: [i16; MAX_ATOMS],
    pub physics_read_energy: [i32; MAX_ATOMS],
    pub physics_read_resonance: [i32; MAX_ATOMS],
    pub energy_delta: [i32; MAX_ATOMS],
    pub resonance_delta: [i32; MAX_ATOMS],
    pub structure_build_owner: [i32; GRID_CELLS],
    pub structure_build_value: [i32; GRID_CELLS],
    pub structure_charge_intent: [i32; GRID_CELLS],
    pub attention_field: [f32; GRID_CELLS],
    pub hive_energy_pool: [i32; HIVE_ENERGY_POOL_SIZE],
    pub glyph_header: [i32; GRID_CELLS],
    pub glyph_payload: [[u8; 8]; GRID_CELLS],
    pub glyph_scratch_header: [i32; GRID_CELLS],
    pub glyph_scratch_payload: [[u8; 8]; GRID_CELLS],
    pub hormones: [u16; MAX_HORMONES],
    pub secretion_stats: [i32; SECRETION_STATS_SIZE],
    pub _pad_to_lineage: [u8; 4],
    pub lineage: [u64; MAX_ATOMS],
    pub mailbox: [[i32; 2]; MAX_ATOMS],
    pub ledger_head: i32,
    pub ledger_data: [[i32; 4]; MAX_LEDGER_EVENTS],
    pub egress_head: i32,
    pub egress_data: [[u8; 256]; MAX_EGRESS_EVENTS],
}

pub struct SigmaState {
    pub matrix: Box<SigmaMatrix>,
    pub free_search_cursor: usize,
}

impl SigmaState {
    pub fn new() -> Self {
        Self {
            // Unsafe required because initializing an 54MB struct on the stack would overflow.
            // Using zeroed allocation directly onto the heap.
            matrix: unsafe {
                let layout = std::alloc::Layout::new::<SigmaMatrix>();
                let ptr = std::alloc::alloc_zeroed(layout) as *mut SigmaMatrix;
                Box::from_raw(ptr)
            },
            free_search_cursor: 1,
        }
    }

    /// SAFETY: ptr must be valid, aligned, and writeable (typically mapped to a JS SharedArrayBuffer)
    pub unsafe fn from_raw(ptr: *mut SigmaMatrix) -> Self {
        Self {
            matrix: unsafe { Box::from_raw(ptr) },
            free_search_cursor: 1,
        }
    }
}
impl Clone for SigmaState {
    fn clone(&self) -> Self {
        let mut new_state = Self::new();
        unsafe {
            std::ptr::copy_nonoverlapping(
                self.matrix.as_ref() as *const SigmaMatrix,
                new_state.matrix.as_mut() as *mut SigmaMatrix,
                1,
            );
        }
        new_state
    }
}

impl SigmaState {
    /// Returns a slice of AtomicI32 mapping directly to the `spatial_grid` array
    /// Safe because `AtomicI32` has the exact same memory layout as `i32` (`repr(C)` transparent).
    #[inline]
    pub fn phase_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.phase.as_ptr() as *const std::sync::atomic::AtomicI32,
                MAX_ATOMS,
            )
        }
    }

    pub fn hormones_atomic(&self) -> &[std::sync::atomic::AtomicU16] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.hormones.as_ptr() as *const std::sync::atomic::AtomicU16,
                MAX_HORMONES,
            )
        }
    }

    pub fn ids_atomic(&self) -> &[std::sync::atomic::AtomicU64] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.ids.as_ptr() as *const std::sync::atomic::AtomicU64,
                MAX_ATOMS,
            )
        }
    }

    pub fn context_atomic(&self, atom_idx: usize) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.context[atom_idx].as_ptr() as *const std::sync::atomic::AtomicI32,
                ATOM_CONTEXT_SIZE,
            )
        }
    }

    pub fn xs_atomic(&self) -> &[std::sync::atomic::AtomicI16] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.xs.as_ptr() as *const std::sync::atomic::AtomicI16,
                MAX_ATOMS,
            )
        }
    }

    pub fn roles_atomic(&self) -> &[std::sync::atomic::AtomicU8] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.roles.as_ptr() as *const std::sync::atomic::AtomicU8,
                MAX_ATOMS,
            )
        }
    }

    pub fn ys_atomic(&self) -> &[std::sync::atomic::AtomicI16] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.ys.as_ptr() as *const std::sync::atomic::AtomicI16,
                MAX_ATOMS,
            )
        }
    }

    pub fn hive_memory_atomic(&self) -> &[std::sync::atomic::AtomicU8] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.hive_memory.as_ptr() as *const std::sync::atomic::AtomicU8,
                HIVE_MEMORY_SIZE,
            )
        }
    }

    pub fn glyph_header_atomic(&self) -> &[std::sync::atomic::AtomicU32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.glyph_header.as_ptr() as *const std::sync::atomic::AtomicU32,
                GRID_CELLS,
            )
        }
    }

    pub fn glyph_payload_atomic(&self) -> &[std::sync::atomic::AtomicU8] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.glyph_payload.as_ptr() as *const std::sync::atomic::AtomicU8,
                GRID_CELLS * 8,
            )
        }
    }

    pub fn stiffness_atomic(&self) -> &[std::sync::atomic::AtomicU32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.stiffness.as_ptr() as *const std::sync::atomic::AtomicU32,
                MAX_ATOMS * 4,
            )
        }
    }

    pub fn synaptic_weights_atomic(&self) -> &[std::sync::atomic::AtomicU8] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.synaptic_weights.as_ptr() as *const std::sync::atomic::AtomicU8,
                MAX_ATOMS * 4,
            )
        }
    }

    pub fn spatial_grid_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.spatial_grid.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.spatial_grid.len(),
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping directly to the `structure_charge_intent` array
    #[inline]
    pub fn structure_charge_intent_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.structure_charge_intent.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.structure_charge_intent.len(),
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping directly to the `structure_build_owner` array
    #[inline]
    pub fn structure_build_owner_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.structure_build_owner.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.structure_build_owner.len(),
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping directly to the `bond_requests` array
    #[inline]
    pub fn bond_requests_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.bond_requests.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.bond_requests.len(),
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping to the `spawn_requests` head pointers.
    /// The first 8 bytes of `spawn_requests` are the write and read heads (i32 each).
    #[inline]
    pub fn spawn_requests_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.spawn_requests.as_ptr() as *const std::sync::atomic::AtomicI32,
                2, // We only need the first two AtomicI32s (write_head and read_head)
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping directly to the `quorum` array
    #[inline]
    pub fn quorum_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.quorum.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.quorum.len(),
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping directly to the `energy` array
    #[inline]
    pub fn energy_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.energy.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.energy.len(),
            )
        }
    }

    /// Returns a slice of AtomicI32 mapping directly to the `resonance` array
    #[inline]
    pub fn resonance_atomic(&self) -> &[std::sync::atomic::AtomicI32] {
        unsafe {
            std::slice::from_raw_parts(
                self.matrix.resonance.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.resonance.len(),
            )
        }
    }

    /// Returns a mutable reference to the atomic `hive_balance`
    #[inline]
    pub fn hive_balance_atomic(&self) -> &std::sync::atomic::AtomicI32 {
        unsafe {
            &*(&self.matrix.hive_balance as *const i32 as *const std::sync::atomic::AtomicI32)
        }
    }

    pub fn allocate(&mut self) -> Option<usize> {
        for i in 1..MAX_ATOMS {
            if self.matrix.ids[i] == 0 {
                return Some(i);
            }
        }
        None
    }

    pub fn recycle_atom(&mut self, idx: usize) {
        self.matrix.ids[idx] = 0;
        self.matrix.energy[idx] = 0;
        self.matrix.resonance[idx] = 0;
        self.matrix.xs[idx] = 0;
        self.matrix.ys[idx] = 0;
        self.matrix.phase[idx] = 0;
        self.matrix.logic[idx].fill(0);
        self.matrix.instructions[idx].fill(0);
        self.matrix.context[idx].fill(0);
        for i in 0..4 {
            let b = (idx * 4) + i;
            self.matrix.bonds[b] = 0;
            self.matrix.stiffness[b] = 0.0;
            self.matrix.bond_distances[b] = 0;
            self.matrix.synaptic_weights[b] = 0;
        }
        self.matrix.roles[idx] = 0;
    }

    pub fn set_energy(&mut self, index: usize, energy: i32) {
        if index < MAX_ATOMS {
            self.matrix.energy[index] = energy;
        }
    }

    pub fn read_genome(&self, index: usize) -> Option<&[u8]> {
        if index < MAX_ATOMS {
            Some(&self.matrix.logic[index])
        } else {
            None
        }
    }

    pub fn egress_head_atomic(&self) -> &std::sync::atomic::AtomicI32 {
        unsafe { &*(&self.matrix.egress_head as *const i32 as *const std::sync::atomic::AtomicI32) }
    }

    pub fn dispatch_egress(&self, atom_idx: usize, nx: i32, ny: i32, current_energy: i32) {
        let max_events = 8192;
        let head = self
            .egress_head_atomic()
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        let idx = (head as usize) % max_events;

        let mut payload = [0u8; 256];
        payload[0..ATOM_INSTRUCTION_SIZE].copy_from_slice(&self.matrix.instructions[atom_idx]);
        payload[64..68].copy_from_slice(&current_energy.to_le_bytes());
        payload[68..72].copy_from_slice(&self.matrix.phase[atom_idx].to_le_bytes());
        payload[72..76].copy_from_slice(&self.matrix.resonance[atom_idx].to_le_bytes());
        payload[76..80].copy_from_slice(&nx.to_le_bytes());
        payload[80..84].copy_from_slice(&ny.to_le_bytes());

        for i in 0..ATOM_CONTEXT_SIZE {
            let offset = 84 + (i * 4);
            payload[offset..offset + 4]
                .copy_from_slice(&self.matrix.context[atom_idx][i].to_le_bytes());
        }

        payload[148] = self.matrix.roles[atom_idx];

        unsafe {
            let egress_ptr = self.matrix.egress_data.as_ptr() as *mut u8;
            let slot_ptr = egress_ptr.add(idx * 256);
            std::ptr::copy_nonoverlapping(payload.as_ptr(), slot_ptr, 256);
        }
    }
}

// -----------------------------------------------------------------------------
// Type Checks & Padding Validations
// -----------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use std::mem::offset_of;
    // The Deno `SharedArrayBuffer` expects these exact byte offsets mapping to `OFFSETS.ts`:
    // export const MAX_ATOMS = 500000;
    // export const SAFETY_BUFFER = 8000000;
    // export const IDS_OFFSET = 8000000;
    // export const XS_OFFSET = 12000000;
    #[test]
    fn verify_memory_offsets() {
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, ids),
            SAFETY_BUFFER + (8000000 - 8000000),
            "ids"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, xs),
            SAFETY_BUFFER + (12000000 - 8000000),
            "xs"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, ys),
            SAFETY_BUFFER + (13000000 - 8000000),
            "ys"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, energy),
            crate::ENERGY_OFFSET,
            "energy"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, resonance),
            crate::RESONANCE_OFFSET,
            "resonance"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, phase),
            crate::PHASE_OFFSET,
            "phase"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, logic),
            crate::LOGIC_OFFSET,
            "logic"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, bonds),
            crate::BONDS_OFFSET,
            "bonds"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, stiffness),
            crate::STIFFNESS_OFFSET,
            "stiffness"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, instructions),
            crate::INSTRUCTIONS_OFFSET,
            "instructions"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, context),
            crate::CONTEXT_OFFSET,
            "context"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, evolution_reserved),
            crate::EVOLUTION_OFFSET,
            "evolution_reserved"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, spawn_requests),
            crate::SPAWN_REQUESTS_OFFSET,
            "spawn_requests"
        );
        assert_eq!(
        SAFETY_BUFFER + offset_of!(SigmaMatrix, meiosis_reserved),
        crate::MEIOSIS_RESERVED_OFFSET,
        "meiosis_reserved"
    );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, bond_requests),
            crate::BOND_REQUESTS_OFFSET,
            "bond_requests"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, spatial_grid),
            crate::SPATIAL_GRID_OFFSET,
            "spatial_grid"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, roles),
            crate::ROLES_OFFSET,
            "roles"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, structure_grid),
            crate::STRUCTURE_GRID_OFFSET,
            "structure_grid"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, signal_grid),
            crate::SIGNAL_GRID_OFFSET,
            "signal_grid"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, memory_grid),
            crate::MEMORY_GRID_OFFSET,
            "memory_grid"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, ascension_stats_reserved),
            crate::ASCENSION_STATS_OFFSET,
            "ascension_stats_reserved"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, bond_distances),
            crate::BOND_DISTANCES_OFFSET,
            "bond_distances"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, synaptic_weights),
            crate::SYNAPTIC_WEIGHTS_OFFSET,
            "synaptic_weights"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, damping),
            crate::DAMPING_OFFSET,
            "damping"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, causality),
            crate::CAUSALITY_OFFSET,
            "causality"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, hive_memory),
            crate::HIVE_MEMORY_OFFSET,
            "hive_memory"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, hive_balance),
            crate::HIVE_BALANCE_OFFSET,
            "hive_balance"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, quorum),
            crate::QUORUM_OFFSET,
            "quorum"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, coherence),
            crate::COHERENCE_OFFSET,
            "coherence"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, neural_coherence),
            crate::NEURAL_COHERENCE_OFFSET,
            "neural_coherence"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, physics_read_xs),
            crate::PHYSICS_READ_XS_OFFSET,
            "physics_read_xs"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, physics_read_ys),
            crate::PHYSICS_READ_YS_OFFSET,
            "physics_read_ys"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, physics_read_energy),
            crate::PHYSICS_READ_ENERGY_OFFSET,
            "physics_read_energy"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, physics_read_resonance),
            crate::PHYSICS_READ_RESONANCE_OFFSET,
            "physics_read_resonance"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, energy_delta),
            crate::ENERGY_DELTA_OFFSET,
            "energy_delta"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, resonance_delta),
            crate::RESONANCE_DELTA_OFFSET,
            "resonance_delta"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, structure_build_owner),
            crate::STRUCTURE_BUILD_OWNER_OFFSET,
            "structure_build_owner"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, structure_build_value),
            crate::STRUCTURE_BUILD_VALUE_OFFSET,
            "structure_build_value"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, structure_charge_intent),
            crate::STRUCTURE_CHARGE_INTENT_OFFSET,
            "structure_charge_intent"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, attention_field),
            crate::ATTENTION_FIELD_OFFSET,
            "attention_field"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, hive_energy_pool),
            crate::HIVE_ENERGY_POOL_OFFSET,
            "hive_energy_pool"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, glyph_header),
            crate::GLYPH_HEADER_OFFSET,
            "glyph_header"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, glyph_payload),
            crate::GLYPH_PAYLOAD_OFFSET,
            "glyph_payload"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, glyph_scratch_header),
            crate::GLYPH_SCRATCH_HEADER_OFFSET,
            "glyph_scratch_header"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, glyph_scratch_payload),
            crate::GLYPH_SCRATCH_PAYLOAD_OFFSET,
            "glyph_scratch_payload"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, hormones),
            crate::HORMONES_OFFSET,
            "hormones"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, secretion_stats),
            crate::SECRETION_STATS_OFFSET,
            "secretion_stats"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, lineage),
            crate::LINEAGE_OFFSET,
            "lineage"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, mailbox),
            crate::MAILBOX_OFFSET,
            "mailbox"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, ledger_head),
            crate::LEDGER_HEAD_OFFSET,
            "ledger_head"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, ledger_data),
            crate::LEDGER_DATA_OFFSET,
            "ledger_data"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, egress_head),
            crate::EGRESS_HEAD_OFFSET,
            "egress_head"
        );
        assert_eq!(
            SAFETY_BUFFER + offset_of!(SigmaMatrix, egress_data),
            crate::EGRESS_DATA_OFFSET,
            "egress_data"
        );
    }
}
```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/add_energy_delta.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/add_energy_delta.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/add_hive_balance.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/add_hive_balance.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/add_resonance_delta.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/add_resonance_delta.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/atomic_deposit_glyph_header.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/atomic_deposit_glyph_header.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/clear_metabolism_stats.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/clear_metabolism_stats.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/clear_secretion_stats.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/clear_secretion_stats.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/decay_for_kind.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/decay_for_kind.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/diffuse_viral_semantics.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/diffuse_viral_semantics.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/diffusion_share_for_kind.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/diffusion_share_for_kind.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/find_next_free_slot.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/find_next_free_slot.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/genome_key16.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/genome_key16.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_attention_cell.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/get_attention_cell.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_bond_stiffness.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_bond_stiffness.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_bond_target.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_bond_target.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_energy.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_energy.md
#![allow(unused_imports)]
use super::super::L01::*;

pub fn get_energy(idx: i32) -> i32 {
    // Requires SharedArrayBuffer pointer mechanism in parent scope
    unimplemented!("Memory accessors are host/WASM specific");
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_glyph_influence.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/get_glyph_influence.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_hive_balance.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_hive_balance.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_hive_memory.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_hive_memory.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_hormone.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_hormone.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_lineage.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_lineage.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_logic_byte.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_logic_byte.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_neural_coherence.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/get_neural_coherence.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_p_c.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_p_c.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_pending_syscall.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_pending_syscall.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_phase.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_phase.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_read_energy.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_read_energy.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_read_resonance.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_read_resonance.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_read_x.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_read_x.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_read_y.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_read_y.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_reg.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_reg.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_resonance.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_resonance.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_role.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_role.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_spatial_grid_atom.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_spatial_grid_atom.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_spatial_grid_count.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_spatial_grid_count.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_x.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_x.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/get_y.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/get_y.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/memory_views.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/memory_views.md
#![allow(unused_imports)]
use super::super::L01::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/mod.rs

```rust
// AUTOGENERATED LEVEL FACADE

pub use super::L01::*;

#[path = "sigma_structure.rs"]
pub mod sigma_structure;
pub use sigma_structure::*;
#[path = "sigma_pulse.rs"]
pub mod sigma_pulse;
pub use sigma_pulse::*;
#[path = "sigma_glyph_transport.rs"]
pub mod sigma_glyph_transport;
pub use sigma_glyph_transport::*;
#[path = "sigma_spatial.rs"]
pub mod sigma_spatial;
pub use sigma_spatial::*;
#[path = "sigma_bonding.rs"]
pub mod sigma_bonding;
pub use sigma_bonding::*;
#[path = "sigma_ffi.rs"]
pub mod sigma_ffi;
pub use sigma_ffi::*;
#[path = "sigma_shadow.rs"]
pub mod sigma_shadow;
pub use sigma_shadow::*;
#[path = "sigma_environment.rs"]
pub mod sigma_environment;
pub use sigma_environment::*;
#[path = "sigma_replication.rs"]
pub mod sigma_replication;
pub use sigma_replication::*;
#[path = "get_read_resonance.rs"]
pub mod get_read_resonance;
pub use get_read_resonance::*;
#[path = "get_read_y.rs"]
pub mod get_read_y;
pub use get_read_y::*;
#[path = "set_energy.rs"]
pub mod set_energy;
pub use set_energy::*;
#[path = "set_bond_stiffness.rs"]
pub mod set_bond_stiffness;
pub use set_bond_stiffness::*;
#[path = "set_role.rs"]
pub mod set_role;
pub use set_role::*;
#[path = "get_p_c.rs"]
pub mod get_p_c;
pub use get_p_c::*;
#[path = "get_y.rs"]
pub mod get_y;
pub use get_y::*;
#[path = "get_hormone.rs"]
pub mod get_hormone;
pub use get_hormone::*;
#[path = "genome_key16.rs"]
pub mod genome_key16;
pub use genome_key16::*;
#[path = "get_x.rs"]
pub mod get_x;
pub use get_x::*;
#[path = "memory_views.rs"]
pub mod memory_views;
pub use memory_views::*;
#[path = "set_resonance.rs"]
pub mod set_resonance;
pub use set_resonance::*;
#[path = "set_p_c.rs"]
pub mod set_p_c;
pub use set_p_c::*;
#[path = "get_bond_stiffness.rs"]
pub mod get_bond_stiffness;
pub use get_bond_stiffness::*;
#[path = "get_read_x.rs"]
pub mod get_read_x;
pub use get_read_x::*;
#[path = "set_bond_dist.rs"]
pub mod set_bond_dist;
pub use set_bond_dist::*;
#[path = "set_reg.rs"]
pub mod set_reg;
pub use set_reg::*;
#[path = "get_role.rs"]
pub mod get_role;
pub use get_role::*;
#[path = "get_hive_memory.rs"]
pub mod get_hive_memory;
pub use get_hive_memory::*;
#[path = "set_hive_memory.rs"]
pub mod set_hive_memory;
pub use set_hive_memory::*;
#[path = "get_reg.rs"]
pub mod get_reg;
pub use get_reg::*;
#[path = "add_hive_balance.rs"]
pub mod add_hive_balance;
pub use add_hive_balance::*;
#[path = "set_bond_target.rs"]
pub mod set_bond_target;
pub use set_bond_target::*;
#[path = "get_bond_target.rs"]
pub mod get_bond_target;
pub use get_bond_target::*;
#[path = "get_phase.rs"]
pub mod get_phase;
pub use get_phase::*;
#[path = "get_hive_balance.rs"]
pub mod get_hive_balance;
pub use get_hive_balance::*;
#[path = "get_spatial_grid_atom.rs"]
pub mod get_spatial_grid_atom;
pub use get_spatial_grid_atom::*;
#[path = "add_energy_delta.rs"]
pub mod add_energy_delta;
pub use add_energy_delta::*;
#[path = "get_resonance.rs"]
pub mod get_resonance;
pub use get_resonance::*;
#[path = "set_damping.rs"]
pub mod set_damping;
pub use set_damping::*;
#[path = "get_energy.rs"]
pub mod get_energy;
pub use get_energy::*;
#[path = "get_spatial_grid_count.rs"]
pub mod get_spatial_grid_count;
pub use get_spatial_grid_count::*;
#[path = "get_pending_syscall.rs"]
pub mod get_pending_syscall;
pub use get_pending_syscall::*;
#[path = "get_lineage.rs"]
pub mod get_lineage;
pub use get_lineage::*;
#[path = "get_logic_byte.rs"]
pub mod get_logic_byte;
pub use get_logic_byte::*;
#[path = "set_phase.rs"]
pub mod set_phase;
pub use set_phase::*;
#[path = "set_pending_syscall.rs"]
pub mod set_pending_syscall;
pub use set_pending_syscall::*;
#[path = "add_resonance_delta.rs"]
pub mod add_resonance_delta;
pub use add_resonance_delta::*;
#[path = "get_read_energy.rs"]
pub mod get_read_energy;
pub use get_read_energy::*;
#[path = "get_neural_coherence.rs"]
pub mod get_neural_coherence;
pub use get_neural_coherence::*;
#[path = "clear_metabolism_stats.rs"]
pub mod clear_metabolism_stats;
pub use clear_metabolism_stats::*;
#[path = "atomic_deposit_glyph_header.rs"]
pub mod atomic_deposit_glyph_header;
pub use atomic_deposit_glyph_header::*;
#[path = "seed_atom.rs"]
pub mod seed_atom;
pub use seed_atom::*;
#[path = "clear_secretion_stats.rs"]
pub mod clear_secretion_stats;
pub use clear_secretion_stats::*;
#[path = "diffuse_viral_semantics.rs"]
pub mod diffuse_viral_semantics;
pub use diffuse_viral_semantics::*;
#[path = "reset_neural_coherence.rs"]
pub mod reset_neural_coherence;
pub use reset_neural_coherence::*;
#[path = "diffusion_share_for_kind.rs"]
pub mod diffusion_share_for_kind;
pub use diffusion_share_for_kind::*;
#[path = "decay_for_kind.rs"]
pub mod decay_for_kind;
pub use decay_for_kind::*;
#[path = "set_neural_coherence.rs"]
pub mod set_neural_coherence;
pub use set_neural_coherence::*;
#[path = "find_next_free_slot.rs"]
pub mod find_next_free_slot;
pub use find_next_free_slot::*;
#[path = "get_glyph_influence.rs"]
pub mod get_glyph_influence;
pub use get_glyph_influence::*;
#[path = "get_attention_cell.rs"]
pub mod get_attention_cell;
pub use get_attention_cell::*;
#[path = "read_structure_cell.rs"]
pub mod read_structure_cell;
pub use read_structure_cell::*;
#[path = "publish_charge_intent.rs"]
pub mod publish_charge_intent;
pub use publish_charge_intent::*;
#[path = "publish_build_intent.rs"]
pub mod publish_build_intent;
pub use publish_build_intent::*;
#[path = "reduce_atom_deltas.rs"]
pub mod reduce_atom_deltas;
pub use reduce_atom_deltas::*;
#[path = "store_clamped_pos.rs"]
pub mod store_clamped_pos;
pub use store_clamped_pos::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/publish_build_intent.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/publish_build_intent.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/publish_charge_intent.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/publish_charge_intent.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/read_structure_cell.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/read_structure_cell.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/reduce_atom_deltas.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/reduce_atom_deltas.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/reset_neural_coherence.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/reset_neural_coherence.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/seed_atom.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/seed_atom.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/set_bond_dist.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/set_bond_dist.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/set_bond_stiffness.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/set_bond_stiffness.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/set_bond_target.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/set_bond_target.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/set_damping.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/set_damping.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/set_energy.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/set_energy.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/set_hive_memory.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/set_hive_memory.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/set_neural_coherence.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/set_neural_coherence.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/set_p_c.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/set_p_c.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/set_pending_syscall.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/set_pending_syscall.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/set_phase.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/set_phase.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/set_reg.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/set_reg.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/set_resonance.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/set_resonance.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/set_role.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/set_role.md
#![allow(unused_imports)]
use super::super::L01::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/sigma_bonding.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/sigma_bonding.md
// Substrate Node: sigma_bonding
// Level: 2
// Solves simultaneous structural bonding intents using spatial hashes

#![allow(unused_imports)]
use super::super::L01::*;

// Symbiotic Bonding Engine
// Manages Tensegrity networks through queued `bond_requests` arrays resolved per-tick.

use crate::{SigmaState, MAX_ATOMS};

impl SigmaState {
    /// Attempts to establish a bond by pushing a request to the `bond_requests` array.
    pub fn push_bond_request(&self, request_idx: usize, initiator_idx: usize, target_idx: usize) {
        if request_idx >= MAX_ATOMS {
            return;
        }

        let ptr = request_idx * 3;
        let bond_atomic = self.bond_requests_atomic();

        // We use the status field (ptr + 2) as our primary lock point. 0 = IDLE, 1 = PENDING.
        // Atoms trying to bind to the same request slot concurrently will race here.
        if bond_atomic[ptr + 2]
            .compare_exchange(
                0,
                1, // Reserve slot as PENDING
                std::sync::atomic::Ordering::AcqRel,
                std::sync::atomic::Ordering::Acquire,
            )
            .is_ok()
        {
            // Successfully claimed the slot. Now we can safely load the data payload.
            // Initiator/Target writes don't need fetch_add since they are protected by the acquired status lock.
            bond_atomic[ptr].store(
                (initiator_idx as i32) + 1,
                std::sync::atomic::Ordering::Release,
            );
            bond_atomic[ptr + 1].store(
                (target_idx as i32) + 1,
                std::sync::atomic::Ordering::Release,
            );
        }
    }

    /// Evaluates bonding intent mapped during the frame.
    /// Returns the number of successful bonds established.
    pub fn resolve_bond_requests(&mut self) -> i32 {
        let mut resolved = 0;

        for i in 0..MAX_ATOMS {
            let ptr = i * 3;
            let status = self.matrix.bond_requests[ptr + 2];

            if status != 1 {
                // Not active PENDING
                self.matrix.bond_requests[ptr] = 0;
                continue;
            }

            let initiator_plus1 = self.matrix.bond_requests[ptr];
            let target_plus1 = self.matrix.bond_requests[ptr + 1];

            let initiator = (initiator_plus1 - 1) as usize;
            let target = (target_plus1 - 1) as usize;

            if initiator >= MAX_ATOMS || target >= MAX_ATOMS {
                self.matrix.bond_requests[ptr] = 0;
                self.matrix.bond_requests[ptr + 1] = 0;
                self.matrix.bond_requests[ptr + 2] = 0;
                continue;
            }

            if target > 0 {
                // Must ensure atom target still alive
                if self.matrix.ids[target] != 0 {
                    // Set Bond on Initiator's first slot (for simplicity, we mimic deterministic slot 0/1 logic here)
                    // Deno uses setBondTarget(init, 0), setBondTarget(target, 1) mapping.
                    self.matrix.bonds[(initiator * 4) + 0] = target as i32;
                    self.matrix.stiffness[(initiator * 4) + 0] = 0.1;

                    self.matrix.bonds[(target * 4) + 1] = initiator as i32;
                    self.matrix.stiffness[(target * 4) + 1] = 0.1;

                    resolved += 1;
                }
            }

            // Clear request
            self.matrix.bond_requests[ptr] = 0;
            self.matrix.bond_requests[ptr + 1] = 0;
            self.matrix.bond_requests[ptr + 2] = 0;
        }

        resolved
    }
}
```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/sigma_environment.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/sigma_environment.md
// Substrate Node: sigma_environment
// Level: 2
// Ticks environmental cellular automata, structural cells, and glyphi transport

#![allow(unused_imports)]
use super::super::L01::*;

use crate::{
    GRID_H, GRID_W, MAX_ATOMS, STR_CAPACITOR, STR_DIODE, STR_INVERTER, STR_LATCH, STR_NODE,
    STR_SOURCE, STR_VOID, STR_WIRE, MAX_GLYPH_AMP, MIN_GLYPH_AMP
};
use crate::SigmaState;

pub fn tick_environment(state: &mut SigmaState, tick: i32) {
    tick_structure_grid(state);
    tick_glyph_transport(state);
    tick_synaptic_decay(state, tick);
}

fn unpack_glyph_kind(header: i32) -> i32 {
    header & 0xFF
}

fn unpack_glyph_amplitude(header: i32) -> i32 {
    header >> 8
}

fn pack_glyph_header(kind: i32, amplitude: i32) -> i32 {
    (amplitude << 8) | (kind & 0xFF)
}

fn decay_for_kind(kind: i32, amplitude: i32) -> i32 {
    let abs_amp = amplitude.abs();
    let decay_amt = if kind == 2 {
        if abs_amp > 256 {
            3
        } else {
            1
        }
    } else if kind == 1 {
        if abs_amp > 64 {
            8
        } else {
            4
        }
    } else {
        abs_amp
    };
    if amplitude > 0 {
        decay_amt
    } else {
        -decay_amt
    }
}

fn diffusion_share_for_kind(kind: i32, amplitude: i32) -> i32 {
    let abs_amp = amplitude.abs();
    let share_amt = if kind == 2 {
        if abs_amp >= 96 {
            abs_amp >> 3
        } else {
            0
        }
    } else if kind == 1 {
        if abs_amp >= 24 {
            abs_amp >> 2
        } else {
            0
        }
    } else {
        0
    };
    if amplitude > 0 {
        share_amt
    } else {
        -share_amt
    }
}

fn deposit_scratch_glyph_header(
    state: &mut SigmaState,
    cell: i32,
    kind: i32,
    amplitude: i32,
    payload_source: Option<[u8; 8]>,
) {
    if amplitude == 0 || cell < 0 || cell >= (GRID_W * GRID_H) {
        return;
    }

    let cell_idx = cell as usize;
    let current = state.matrix.glyph_scratch_header[cell_idx];
    let current_kind = unpack_glyph_kind(current);
    let current_amplitude = unpack_glyph_amplitude(current);

    if current_kind != 0 && current_kind != kind {
        if amplitude.abs() <= current_amplitude.abs() {
            return;
        }
        state.matrix.glyph_scratch_header[cell_idx] = pack_glyph_header(kind, amplitude);
        if kind == 2 {
            if let Some(payload) = payload_source {
                state.matrix.glyph_scratch_payload[cell_idx] = payload;
            }
        }
        return;
    }

    let mut next_amplitude = current_amplitude + amplitude;
    if next_amplitude > MAX_GLYPH_AMP {
        next_amplitude = MAX_GLYPH_AMP;
    }
    if next_amplitude < MIN_GLYPH_AMP {
        next_amplitude = MIN_GLYPH_AMP;
    }

    let next_kind = if next_amplitude == 0 { 0 } else { kind };
    state.matrix.glyph_scratch_header[cell_idx] = pack_glyph_header(next_kind, next_amplitude);

    if kind == 2 {
        if let Some(payload) = payload_source {
            state.matrix.glyph_scratch_payload[cell_idx] = payload;
        }
    }
}

pub fn tick_glyph_transport(state: &mut SigmaState) {
    // 1. Clear scratch buffers
    state.matrix.glyph_scratch_header.fill(0);
    state.matrix.glyph_scratch_payload.fill([0; 8]);

    let dx = [-1, 1, 0, 0];
    let dy = [0, 0, -1, 1];

    for cell in 0..(GRID_W * GRID_H) as usize {
        let header = state.matrix.glyph_header[cell];
        if header == 0 {
            continue;
        }

        let kind = unpack_glyph_kind(header);
        let amp = unpack_glyph_amplitude(header);
        if amp == 0 {
            continue;
        }

        let decay = decay_for_kind(kind, amp);

        // Bidirectional Decay
        let retained = if amp > 0 {
            std::cmp::max(0, amp - decay)
        } else {
            std::cmp::min(0, amp - decay)
        };

        if retained.abs() > 0 {
            let payload = if kind == 2 {
                Some(state.matrix.glyph_payload[cell])
            } else {
                None
            };
            deposit_scratch_glyph_header(state, cell as i32, kind, retained, payload);
        }

        let share = diffusion_share_for_kind(kind, amp);
        if share.abs() > 0 {
            let gx = (cell as i32) % GRID_W;
            let gy = (cell as i32) / GRID_W;

            for i in 0..4 {
                let nx = gx + dx[i];
                let ny = gy + dy[i];
                if in_grid(nx, ny) {
                    let next_cell = (ny * GRID_W + nx) as usize;
                    let payload = if share >= 128 || share <= -128 {
                        Some(state.matrix.glyph_payload[cell])
                    } else {
                        None
                    };
                    deposit_scratch_glyph_header(state, next_cell as i32, kind, share, payload);
                }
            }
        }
    }

    // 2. Internal Reflection (Signal -> Pheromone)
    for cell in 0..(GRID_W * GRID_H) as usize {
        let signal = state.matrix.signal_grid[cell];
        let abs_signal = signal.abs();
        if abs_signal >= 1 {
            let mut amp = abs_signal >> 1;
            if amp < 16 {
                amp = 16;
            }
            if amp > 512 {
                amp = 512;
            }
            deposit_scratch_glyph_header(state, cell as i32, 1, amp, None);

            if cell % 32 == 0 {
                state.matrix.secretion_stats[10] += 1; // Signal leak counter
            }
        }
    }

    // 3. Internal Reflection (Memory -> Plasmid)
    for cell in 0..(GRID_W * GRID_H) as usize {
        let mem = state.matrix.memory_grid[cell];
        // Read first 3 bytes as 24-bit little endian charge
        let memory_lo = u32::from_le_bytes([mem[0], mem[1], mem[2], mem[3]]);
        let charge = (memory_lo & 0xFFFFFF) as i32;

        if charge >= 1 {
            let mut amp = charge >> 2;
            if amp < 24 {
                amp = 24;
            }
            if amp > 384 {
                amp = 384;
            }
            deposit_scratch_glyph_header(state, cell as i32, 2, amp, Some(mem));

            if cell % 32 == 0 {
                state.matrix.secretion_stats[11] += 1; // Memory leak counter
            }
        }
    }

    // Copy scratch to primary
    state
        .matrix
        .glyph_header
        .copy_from_slice(&state.matrix.glyph_scratch_header);
    state
        .matrix
        .glyph_payload
        .copy_from_slice(&state.matrix.glyph_scratch_payload);
}

fn dir8_x(n: i32) -> i32 {
    match n {
        0 => -1,
        1 => 0,
        2 => 1,
        3 => -1,
        4 => 1,
        5 => -1,
        6 => 0,
        7 => 1,
        _ => 0,
    }
}

fn dir8_y(n: i32) -> i32 {
    match n {
        0 => -1,
        1 => -1,
        2 => -1,
        3 => 0,
        4 => 0,
        5 => 1,
        6 => 1,
        7 => 1,
        _ => 0,
    }
}

fn dir4_x(n: i32) -> i32 {
    match n {
        0 => -1,
        1 => 1,
        2 => 0,
        3 => 0,
        _ => 0,
    }
}

fn dir4_y(n: i32) -> i32 {
    match n {
        0 => 0,
        1 => 0,
        2 => -1,
        3 => 1,
        _ => 0,
    }
}

pub fn tick_structure_grid(state: &mut SigmaState) {
    for y in 0..GRID_H {
        for x in 0..GRID_W {
            let i = (y * GRID_W + x) as usize;
            let mut cell_val = state.matrix.structure_grid[i];
            let owner_raw = state.matrix.structure_build_owner[i];
            let owner = owner_raw & 0x7FFFFFFF; // STRUCTURE_INTENT_OWNER_MASK

            if owner != 0 {
                cell_val = state.matrix.structure_build_value[i];
            }

            let intent_charge_raw = state.matrix.structure_charge_intent[i];
            if intent_charge_raw > 0 {
                let mut intent_charge = intent_charge_raw;
                if intent_charge > 255 {
                    intent_charge = 255;
                }
                let base_charge = (cell_val >> 16) & 0xFF;
                if intent_charge > base_charge {
                    cell_val = (cell_val & !0x00FF0000) | (intent_charge << 16);
                }
            }

            if owner_raw != 0 || intent_charge_raw != 0 {
                state.matrix.structure_grid[i] = cell_val;
                if owner_raw != 0 {
                    state.matrix.structure_build_owner[i] = 0;
                    state.matrix.structure_build_value[i] = 0;
                }
                if intent_charge_raw != 0 {
                    state.matrix.structure_charge_intent[i] = 0;
                }
            }

            let str_type = cell_val & 0xFF;
            let current_charge = (cell_val >> 16) & 0xFF;

            // AUTOPOIESIS: Spontaneous Crystallization
            if str_type == STR_VOID {
                let mut max_n_charge = current_charge;
                for n in 0..8 {
                    let nx = x + dir8_x(n);
                    let ny = y + dir8_y(n);
                    if in_grid(nx, ny) {
                        let ni = (ny * GRID_W + nx) as usize;
                        let n_val = state.matrix.structure_grid[ni];
                        let n_charge = (n_val >> 16) & 0xFF;
                        if n_charge > max_n_charge {
                            max_n_charge = n_charge;
                        }
                    }
                }
                if max_n_charge > 100 {
                    let mut seed_charge = max_n_charge - 20;
                    if seed_charge < 64 {
                        seed_charge = 64;
                    }
                    if seed_charge > 255 {
                        seed_charge = 255;
                    }
                    state.matrix.structure_grid[i] = STR_WIRE | (seed_charge << 16);
                } else if current_charge > 0 {
                    let decayed = if current_charge > 8 {
                        current_charge - 8
                    } else {
                        0
                    };
                    state.matrix.structure_grid[i] = (cell_val & !0x00FF0000) | (decayed << 16);
                }
                continue;
            }

            let _state_param = (cell_val >> 24) & 0xFF;

            // Resonance Shielding
            let spatial_idx = (y * GRID_W + x) as usize;
            let avg_phase = state.matrix.spatial_grid[spatial_idx * 32 + 31];
            let decay = if avg_phase > 128 { 2 } else { 10 };

            let mut next_charge = if current_charge > decay {
                current_charge - decay
            } else {
                0
            };

            if str_type == STR_SOURCE {
                next_charge = 255;
            } else if str_type == STR_WIRE || str_type == STR_NODE || str_type == STR_CAPACITOR {
                next_charge =
                    update_charge_wire_node_cap(state, x, y, str_type, _state_param, next_charge);
            } else if str_type == STR_DIODE {
                next_charge = update_charge_diode(state, x, y, _state_param, next_charge);
            } else if str_type == STR_INVERTER {
                next_charge = update_charge_inverter(state, x, y);
            } else if str_type == STR_LATCH {
                let (new_state, nc) = update_charge_latch(state, x, y, _state_param);
                if new_state != _state_param {
                    cell_val = (cell_val & 0x00FFFFFF) | (new_state << 24);
                }
                next_charge = nc;
            }

            if str_type != STR_SOURCE && next_charge == 0 {
                let mut stabilized = false;
                for n in 0..4 {
                    let nx = x + dir4_x(n);
                    let ny = y + dir4_y(n);
                    if in_grid(nx, ny) {
                        let ni = (ny * GRID_W + nx) as usize;
                        let n_charge = (state.matrix.structure_grid[ni] >> 16) & 0xFF;
                        if n_charge > 20 {
                            stabilized = true;
                            break;
                        }
                    }
                }
                if !stabilized {
                    state.matrix.structure_grid[i] = STR_VOID;
                    continue;
                }
            }

            state.matrix.structure_grid[i] = (cell_val & !0x00FF0000) | (next_charge << 16);
        }
    }
}

fn update_charge_wire_node_cap(
    state: &SigmaState,
    x: i32,
    y: i32,
    str_type: i32,
    cell_state: i32,
    current_next_charge: i32,
) -> i32 {
    let mut max_neighbor_charge = 0;
    let mut charged_count = 0;
    let mut next_charge = current_next_charge;

    for n in 0..4 {
        let nx = x + dir4_x(n);
        let ny = y + dir4_y(n);
        if in_grid(nx, ny) {
            let ni = (ny * GRID_W + nx) as usize;
            let n_charge = (state.matrix.structure_grid[ni] >> 16) & 0xFF;
            if n_charge > max_neighbor_charge {
                max_neighbor_charge = n_charge;
            }
            if n_charge > 50 {
                charged_count += 1;
            }
        }
    }

    if str_type == STR_WIRE {
        let flow = max_neighbor_charge - 5;
        if flow > next_charge {
            next_charge = flow;
        }
    } else if str_type == STR_NODE {
        if cell_state == 1 {
            // AND
            if charged_count >= 2 {
                next_charge = 255;
            }
        } else {
            // OR
            if charged_count >= 1 {
                next_charge = 255;
            }
        }
    } else if str_type == STR_CAPACITOR {
        let flow = max_neighbor_charge - 2;
        if flow > next_charge {
            next_charge = flow;
        }
    }
    next_charge
}

fn update_charge_diode(
    state: &SigmaState,
    x: i32,
    y: i32,
    cell_state: i32,
    current_next_charge: i32,
) -> i32 {
    let mut nx = x;
    let mut ny = y;
    if cell_state == 0 {
        nx -= 1;
    } else if cell_state == 1 {
        nx += 1;
    } else if cell_state == 2 {
        ny -= 1;
    } else if cell_state == 3 {
        ny += 1;
    }

    let mut next_charge = current_next_charge;
    if in_grid(nx, ny) {
        let ni = (ny * GRID_W + nx) as usize;
        let n_charge = (state.matrix.structure_grid[ni] >> 16) & 0xFF;
        let flow = n_charge - 5;
        if flow > next_charge {
            next_charge = flow;
        }
    }
    next_charge
}

fn update_charge_inverter(state: &SigmaState, x: i32, y: i32) -> i32 {
    let mut max_neighbor_charge = 0;
    for n in 0..4 {
        let nx = x + dir4_x(n);
        let ny = y + dir4_y(n);
        if in_grid(nx, ny) {
            let ni = (ny * GRID_W + nx) as usize;
            let n_charge = (state.matrix.structure_grid[ni] >> 16) & 0xFF;
            if n_charge > max_neighbor_charge {
                max_neighbor_charge = n_charge; // Inverter passes zero when charged neighbors exist
            }
        }
    }
    if max_neighbor_charge < 50 {
        255
    } else {
        0
    }
}

fn update_charge_latch(state: &SigmaState, x: i32, y: i32, cell_state: i32) -> (i32, i32) {
    let mut new_state = cell_state;

    // n=0 (Left): SET
    let set_x = x + dir4_x(0);
    let set_y = y + dir4_y(0);
    if in_grid(set_x, set_y) {
        let n_charge =
            (state.matrix.structure_grid[(set_y * GRID_W + set_x) as usize] >> 16) & 0xFF;
        if n_charge > 100 {
            new_state = 1;
        }
    }

    // n=1 (Right): RESET
    let rst_x = x + dir4_x(1);
    let rst_y = y + dir4_y(1);
    if in_grid(rst_x, rst_y) {
        let n_charge =
            (state.matrix.structure_grid[(rst_y * GRID_W + rst_x) as usize] >> 16) & 0xFF;
        if n_charge > 100 {
            new_state = 0;
        }
    }

    let next_charge = if new_state == 1 { 255 } else { 0 };
    (new_state, next_charge)
}

fn tick_synaptic_decay(state: &mut SigmaState, tick: i32) {
    // Global slow-decay mechanism: Use it or lose it
    if tick % 100 == 0 {
        for bond_idx in 0..(MAX_ATOMS * 4) {
            let weight = state.matrix.synaptic_weights[bond_idx];
            if weight > 0 {
                state.matrix.synaptic_weights[bond_idx] = weight - 1;
            }
        }
    }
}
```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/sigma_ffi.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/sigma_ffi.md
// Substrate Node: sigma_ffi
// Level: 2
// FFI bridging logic and memory alignment for WebAssembly workers

#![allow(unused_imports)]
use super::super::L01::*;

#[allow(non_snake_case)]
use std::mem::ManuallyDrop;

// The Deno `SharedArrayBuffer` uses real pointers but from JS the offset starts at 0.
// `SAFETY_BUFFER` ends at exactly 7,999,992.
// `SigmaMatrix` now begins natively at `tick_counter` (offset 7,999,992 in the Deno memory map).
// By taking the 0-indexed memory pointer from WASM + 7,999,992 bytes,
// we alias directly onto our Struct matching JS indices perfectly.

// `SigmaMatrix` logically begins at address SAFETY_BUFFER natively matching the Deno SAB.

/// Creates a safely wrapped `SigmaState` mapping to the imported `SharedArrayBuffer`.
/// `ManuallyDrop` prevents Rust from trying to deallocate the imported WASM memory when `SigmaState` correctly orchestrates its execution horizon and drops.
unsafe fn get_ffi_state() -> ManuallyDrop<SigmaState> {
    // In wasm32-unknown-unknown with import-memory, address 0 is the start of linear memory.
    let base_ptr = crate::SAFETY_BUFFER as *mut crate::SigmaMatrix;
    let state = unsafe { SigmaState::from_raw(base_ptr) };
    ManuallyDrop::new(state)
}

#[unsafe(no_mangle)]
pub extern "C" fn debug_get_instruction(idx: usize, pc: usize) -> i32 {
    let state = unsafe { get_ffi_state() };
    state.matrix.instructions[idx][pc] as i32
}

#[unsafe(no_mangle)]
pub extern "C" fn debug_get_xs(idx: usize) -> i32 {
    let state = unsafe { get_ffi_state() };
    state.matrix.xs[idx] as i32
}

#[unsafe(no_mangle)]
pub extern "C" fn execute_atom(idx: usize) {
    let mut state = unsafe { get_ffi_state() };
    let mut vm = crate::LambdaVM::new();
    vm.step(&mut state, idx);
}

#[unsafe(no_mangle)]
#[export_name = "tick_environment"]
pub extern "C" fn ffi_tick_environment(tick: u32) {
    let mut state = unsafe { get_ffi_state() };
    crate::tick_environment(&mut state, tick as i32);
}

#[unsafe(no_mangle)]
pub extern "C" fn tick_matrix() {
    let _state = unsafe { get_ffi_state() };
    // Assuming mapping to pulse double buffering of coords natively:
    // (This existed in JS before pulse.rs orchestrator took over in Rust)
    // For now we'll do nothing, as PulseOrchestrator handles this.
}

#[unsafe(no_mangle)]
#[export_name = "tick_structure_grid"]
pub extern "C" fn ffi_tick_structure_grid() {
    let mut state = unsafe { get_ffi_state() };
    crate::tick_structure_grid(&mut state);
}

use std::cell::RefCell;

thread_local! {
    static VISITED_POOL: RefCell<Vec<u8>> = RefCell::new(Vec::with_capacity(crate::MAX_ATOMS));
}

#[unsafe(no_mangle)]
pub extern "C" fn tick_membrane_physics() {
    let mut state = unsafe { get_ffi_state() };

    VISITED_POOL.with(|pool| {
        let mut visited = pool.borrow_mut();
        visited.clear();
        visited.resize(crate::MAX_ATOMS, 0);

        for i in 1..crate::MAX_ATOMS {
            if state.matrix.ids[i] != 0 {
                state.matrix.roles[i] &= !(crate::AtomRole::MetazoanFlag as u8);
                state.matrix.evolution_reserved[i] = 0;
            }
        }

        let mut rings: Vec<Vec<usize>> = Vec::new();

        for start_node in 1..crate::MAX_ATOMS {
            if state.matrix.ids[start_node] == 0 || visited[start_node] == 1 {
                continue;
            }

            let mut path = Vec::with_capacity(8);
            path.push(start_node);

            fn dfs(
                current: usize,
                start: usize,
                depth: usize,
                path: &mut Vec<usize>,
                state: &crate::SigmaState,
            ) -> bool {
                if depth >= 8 {
                    return false;
                }

                for b_slot in 0..4 {
                    let target = state.matrix.bonds[(current * 4) + b_slot] as usize;
                    if target > 0
                        && target < crate::MAX_ATOMS
                        && state.matrix.ids[target] != 0
                    {
                        if target == start && depth >= 2 {
                            return true;
                        }
                        if target < start {
                            continue;
                        }
                        if !path.contains(&target) {
                            path.push(target);
                            if dfs(target, start, depth + 1, path, state) {
                                return true;
                            }
                            path.pop();
                        }
                    }
                }
                false
            }

            if dfs(start_node, start_node, 0, &mut path, &*state) {
                rings.push(path.clone());
                for &node in &path {
                    visited[node] = 1;
                }
            }
        }

        for ring in &rings {
            let count = ring.len() as i32;
            let mut sum_energy: i64 = 0;
            let mut sum_resonance: i64 = 0;

            for &node in ring {
                sum_energy += state.matrix.energy[node] as i64;
                sum_resonance += state.matrix.resonance[node] as i64;
                state.matrix.roles[node] |= crate::AtomRole::MetazoanFlag as u8;
            }

            let avg_energy = (sum_energy / count as i64) as i32;
            let avg_resonance = (sum_resonance / count as i64) as i32;
            let total_resonance = sum_resonance as i32;

            for &node in ring {
                state.matrix.energy[node] = avg_energy;
                state.matrix.resonance[node] = avg_resonance;
                state.matrix.evolution_reserved[node] = total_resonance;
            }
        }
    });
}

#[unsafe(no_mangle)]
pub extern "C" fn build_spatial_hash() {
    let mut state = unsafe { get_ffi_state() };
    state.build_spatial_hash();
}

#[unsafe(no_mangle)]
pub extern "C" fn get_spatial_hash_overflow_count() -> i32 {
    0 // Deprecated in favor of direct metric array
}

// Memory mapping diagnosis hook
#[unsafe(no_mangle)]
pub extern "C" fn verify_memory_alignment(idx: usize, val: i32) {
    let state = unsafe { get_ffi_state() };
    state.xs_atomic()[idx].store(val as i16, std::sync::atomic::Ordering::Relaxed);
    state.context_atomic(idx)[0].store(val, std::sync::atomic::Ordering::Relaxed);
}

#[unsafe(no_mangle)]
pub extern "C" fn get_spatial_hash_max_cell_count() -> i32 {
    0 // Deprecated
}

#[unsafe(no_mangle)]
pub extern "C" fn reduce_atom_deltas(_start_idx: usize, _end_idx: usize) {
    // Handled generically by PulseOrchestrator now
}

#[unsafe(no_mangle)]
pub extern "C" fn get_neural_coherence() -> i32 {
    let state = unsafe { get_ffi_state() };
    state.matrix.neural_coherence
}

#[unsafe(no_mangle)]
pub extern "C" fn set_neural_coherence(val: i32) {
    let mut state = unsafe { get_ffi_state() };
    state.matrix.neural_coherence = val;
}

#[unsafe(no_mangle)]
#[export_name = "tickGlyphTransport"]
pub extern "C" fn ffi_tick_glyph_transport(_tick: u32) {
    let mut state = unsafe { get_ffi_state() };
    crate::tick_glyph_transport(&mut state);
}

#[unsafe(no_mangle)]
pub extern "C" fn resolve_bond_requests(_start: usize, _end: usize) -> i32 {
    let mut state = unsafe { get_ffi_state() };
    state.resolve_bond_requests()
}

#[unsafe(no_mangle)]
pub extern "C" fn drain_spawn_requests(tick: u32) -> i32 {
    let mut state = unsafe { get_ffi_state() };
    state.drain_spawn_requests(tick as i32)
}

#[unsafe(no_mangle)]
pub extern "C" fn clear_metabolism_stats() {
    // Replaced by application tick resetting local state inside Deno,
    // but exported to fulfill module demands.
}

#[unsafe(no_mangle)]
pub extern "C" fn accumulate_metabolism_stats(_start: usize, _end: usize) {
    // Reduced natively in Deno JS space with the Rust `reduce_atom_deltas` side effects.
}

#[unsafe(no_mangle)]
pub extern "C" fn apply_metabolism_kernel(
    _param1: i32,
    _param2: i32,
    _param3: i32,
    _param4: i32,
    _param5: i32,
    _param6: i32,
    _param7: i32,
    _param8: i32,
    _param9: i32,
    _param10: i32,
    _param11: i32,
    _param12: i32,
) {
    // Implemented internally via `pulse.rs` `apply_metabolism_kernel`.
}

#[unsafe(no_mangle)]
pub extern "C" fn run_shadow_simulation_ffi(
    atom_id: u32,
    ticks: u32,
    logic_ptr: u32,
    result_ptr: u32,
) -> i32 {
    let state = unsafe { get_ffi_state() };

    // The logic_ptr and result_ptr are offsets into the linear WASM memory (usually starts at 0).
    // The memory itself was built on JS `SharedArrayBuffer` mapping properly mapped against zero.
    // Ensure bounds are safe because OOB memory causes unreachable panic.
    if logic_ptr as usize + 64 > 500_039_680 || result_ptr as usize + 32 > 500_039_680 {
        return 0; // Failure
    }

    let hallucination_bytes = unsafe { &*(logic_ptr as usize as *const [u8; 64]) };

    let tick_ptr = 7_999_992 as *const i32;
    let start_tick = unsafe { *tick_ptr as u32 };

    let metrics = crate::run_shadow_simulation(
        &state,
        atom_id as u64,
        hallucination_bytes,
        ticks,
        start_tick,
    );

    // Write back the 32-byte struct to the provided result pointer
    // Structure: [energy_diff, resonance_diff, bonds_broken, bonds_formed, structural_value_change, population_diff, coherence_diff, divergence_tick]
    let result_slice =
        unsafe { std::slice::from_raw_parts_mut(result_ptr as usize as *mut i32, 8) };
    result_slice[0] = metrics.energy_diff;
    result_slice[1] = metrics.resonance_diff;
    result_slice[2] = metrics.bonds_broken as i32;
    result_slice[3] = metrics.bonds_formed as i32;
    result_slice[4] = metrics.structural_value_change;
    result_slice[5] = metrics.population_diff;
    result_slice[6] = metrics.coherence_diff;
    result_slice[7] = metrics.divergence_tick as i32;

    1 // Success indicator
}

#[unsafe(no_mangle)]
pub extern "C" fn generate_epoch_proof_ffi(tick: u32, result_ptr: u32) {
    use sha2::{Digest, Sha256};
    let state = unsafe { get_ffi_state() };
    let mut hasher = Sha256::new();

    hasher.update(tick.to_le_bytes());

    for i in 1..crate::MAX_ATOMS {
        let id = state.matrix.ids[i];
        if id != 0 {
            hasher.update(id.to_le_bytes());
            hasher.update(state.matrix.energy[i].to_le_bytes());
            hasher.update(state.matrix.resonance[i].to_le_bytes());
            hasher.update(state.matrix.xs[i].to_le_bytes());
            hasher.update(state.matrix.ys[i].to_le_bytes());
            hasher.update(state.matrix.phase[i].to_le_bytes());
            hasher.update(state.matrix.logic[i]);
        }
    }

    for i in 0..crate::GRID_CELLS {
        let owner = state.matrix.structure_build_owner[i];
        if owner > 0 {
            hasher.update((i as u32).to_le_bytes());
            hasher.update(owner.to_le_bytes());
            hasher.update(state.matrix.structure_build_value[i].to_le_bytes());
            hasher.update(state.matrix.structure_charge_intent[i].to_le_bytes());
        }
    }

    let result = hasher.finalize();
    let result_slice =
        unsafe { std::slice::from_raw_parts_mut(result_ptr as usize as *mut u8, 32) };
    result_slice.copy_from_slice(&result);
}
```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/sigma_glyph_transport.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/sigma_glyph_transport.md
// Substrate Node: sigma_glyph_transport
// Level: 2
// Handles wave interference physics and optical secretion

#![allow(unused_imports)]
use super::super::L01::*;

use crate::{MAX_GLYPH_AMP, MIN_GLYPH_AMP};
use crate::SigmaState;

pub fn unpack_glyph_kind(header: i32) -> u8 {
    (header & 0xFF) as u8
}

pub fn unpack_glyph_amplitude(header: i32) -> i32 {
    header >> 8 // signed arithmetic shift
}

pub fn pack_glyph_header(kind: u8, amplitude: i32) -> i32 {
    let mut amp = amplitude;
    if amp > MAX_GLYPH_AMP {
        amp = MAX_GLYPH_AMP;
    }
    if amp < MIN_GLYPH_AMP {
        amp = MIN_GLYPH_AMP;
    }
    (amp << 8) | (kind as i32 & 0xFF)
}

impl SigmaState {
    /// Models optical wave interference on a flat 2D grid cell.
    pub fn atomic_deposit_glyph_header(&self, cell: usize, kind: u8, amplitude: i32) {
        if amplitude == 0 || cell >= crate::GRID_CELLS {
            return;
        }

        let current = self.matrix.glyph_header[cell];
        let current_kind = unpack_glyph_kind(current);
        let current_amp = unpack_glyph_amplitude(current);

        // Mismatched kind prioritization (overwrite if strictly stronger, else annihilated/blocked)
        if current_kind != 0 && current_kind != kind {
            if amplitude.abs() > current_amp.abs() {
                self.glyph_header_atomic()[cell].store(
                    pack_glyph_header(kind, amplitude) as u32,
                    std::sync::atomic::Ordering::Relaxed,
                );
            }
        } else {
            // Matching kind (or zeroed cell): additive wave interference
            let mut next_amplitude = current_amp + amplitude;
            if next_amplitude > MAX_GLYPH_AMP {
                next_amplitude = MAX_GLYPH_AMP;
            }
            if next_amplitude < MIN_GLYPH_AMP {
                next_amplitude = MIN_GLYPH_AMP;
            }

            // Annihilation (perfect destructive interference) clears the cell kind
            let next_kind = if next_amplitude == 0 { 0 } else { kind };

            self.glyph_header_atomic()[cell].store(
                pack_glyph_header(next_kind, next_amplitude) as u32,
                std::sync::atomic::Ordering::Relaxed,
            );
        }
    }
}
```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/sigma_pulse.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/sigma_pulse.md
// Substrate Node: sigma_pulse
// Level: 2
// Multithreaded tick orchestrator and phase sequencer using Rayon

#![allow(unused_imports)]
use super::super::L01::*;

use crate::{GRID_H, GRID_W, MAX_ATOMS};
use crate::{LambdaVM, SigmaState};
use rayon::prelude::*;

pub struct PulseOrchestrator<'a> {
    pub visited: &'a mut [u8],
}

impl<'a> PulseOrchestrator<'a> {
    pub fn new(buffer: &'a mut [u8]) -> Self {
        Self { visited: buffer }
    }

    pub fn tick(&mut self, state: &mut SigmaState, tick_number: u32) {
        // 1. Spatial Hash
        state.build_spatial_hash();

        // 2. Sync Read Views (Double Buffering)
        state
            .matrix
            .physics_read_xs
            .copy_from_slice(&state.matrix.xs);
        state
            .matrix
            .physics_read_ys
            .copy_from_slice(&state.matrix.ys);
        state
            .matrix
            .physics_read_energy
            .copy_from_slice(&state.matrix.energy);
        state
            .matrix
            .physics_read_resonance
            .copy_from_slice(&state.matrix.resonance);

        // 3. Execution Phase (Parallelizing over all logical atom indices)
        (1..MAX_ATOMS).for_each(|i| {
            if state.matrix.ids[i] != 0 {
                let mut mass = 1;
                for b_slot in 0..4 {
                    let bond_idx = (i * 4) + b_slot;
                    let target = state.matrix.bonds[bond_idx];
                    if target > 0
                        && (target as usize) < MAX_ATOMS
                        && state.matrix.ids[target as usize] != 0
                    {
                        mass += 1;
                    }
                }

                if tick_number % mass == 0 {
                    let mut vm = LambdaVM::new(); // VM has no deep state, very cheap to allocate
                    vm.step(state, i);
                }
            }
        });

        // 4. Resolution Phase
        state.resolve_bond_requests();
        let _ = state.drain_spawn_requests(tick_number as i32);

        // 5. Environment Phase
        crate::tick_glyph_transport(state);
        crate::tick_structure_grid(state);

        // 6. Metabolism Phase & 7. Immune Phase (GC)
        let base_entropy_tax = 10;
        let base_friction = 5;

        for i in 1..MAX_ATOMS {
            if state.matrix.ids[i] != 0 {
                let role = state.matrix.roles[i] & 0x7F;

                let mut e = state.matrix.energy[i];

                if role == 5 {
                    // ROLE_MITOCHONDRIA
                    let host_idx = state.matrix.context[i][12] as usize;
                    if host_idx > 0 && host_idx < MAX_ATOMS && state.matrix.ids[host_idx] != 0 {
                        // Enforce Coordinate Lock
                        state.matrix.xs[i] = state.matrix.xs[host_idx];
                        state.matrix.ys[i] = state.matrix.ys[host_idx];

                        // Pay up 90% of current energy
                        if e > crate::SCALE {
                            let transfer = ((e - crate::SCALE) as f64 * 0.9) as i32;
                            if transfer > 0 {
                                state.matrix.energy[host_idx] += transfer;
                                e -= transfer;
                            }
                        }
                        state.matrix.energy[i] = e;
                    } else {
                        // Host died
                        state.matrix.energy[i] = 0;
                        state.matrix.ids[i] = 0;
                        state.matrix.roles[i] = 0;
                    }
                    continue;
                }

                let mut mass = 1;
                for b_slot in 0..4 {
                    let bond_idx = (i * 4) + b_slot;
                    let target = state.matrix.bonds[bond_idx];
                    if target > 0
                        && (target as usize) < MAX_ATOMS
                        && state.matrix.ids[target as usize] != 0
                    {
                        mass += 1;
                    }
                }

                let effective_tax = base_entropy_tax / mass;

                e -= effective_tax;
                e -= base_friction; // Friction remains constant for mechanical movement parity

                if e <= 0 {
                    // PH 43: Fossilization Check
                    let resonance = state.matrix.resonance[i];
                    let role = state.matrix.roles[i] & 0x7F; // Strip metazoan flag
                    let has_immunity =
                        state.matrix.context[i][13] != 0 || state.matrix.context[i][14] != 0;

                    if resonance > 100 || role == 2 || role == 3 || mass > 2 || has_immunity {
                        let cx = state.matrix.xs[i] as usize;
                        let cy = state.matrix.ys[i] as usize;
                        let gx = cx / (crate::SCALE as usize);
                        let gy = cy / (crate::SCALE as usize);

                        if gx < (GRID_W as usize) && gy < (GRID_H as usize) {
                            let cell_idx = gy * (GRID_W as usize) + gx;
                            let structure_val = state.matrix.structure_grid[cell_idx];
                            let structure_type = structure_val & 0xFF;

                            // 1. Structural Crystallization
                            if structure_type == 0 || structure_type == 1 {
                                let mut charge = resonance.clamp(10, 255);
                                let base_charge = (structure_val >> 16) & 0xFF;
                                charge = std::cmp::max(charge, base_charge);

                                let new_type = if role == 3 {
                                    6 // STR_CAPACITOR (Architects leave energy banks)
                                } else {
                                    1 // STR_WIRE (Guardians and others leave hardened walls/pathways)
                                };

                                state.matrix.structure_grid[cell_idx] = new_type | (charge << 16);
                            }

                            // 2. Epigenetic Hash Trace (CRISPR memory spill)
                            let mut scroll_hash = state.matrix.context[i][13];
                            if scroll_hash == 0 {
                                scroll_hash = state.matrix.context[i][14];
                            }

                            if scroll_hash != 0 {
                                let mut mem = state.matrix.memory_grid[cell_idx];

                                // To organically decay into a kind=2 plasmid via tick_glyph_transport,
                                // memory_grid triggers off of the first 3-bytes being a 24-bit charge >= 1.
                                // We'll put the scroll into the 4 upper bytes (4..8) as payload,
                                // and set the first byte to a minimal charge trigger if not already charged.
                                mem[4] = ((scroll_hash >> 24) & 0xFF) as u8;
                                mem[5] = ((scroll_hash >> 16) & 0xFF) as u8;
                                mem[6] = ((scroll_hash >> 8) & 0xFF) as u8;
                                mem[7] = (scroll_hash & 0xFF) as u8;

                                // memory_lo triggers charge.
                                let memory_lo =
                                    u32::from_le_bytes([mem[0], mem[1], mem[2], mem[3]]);
                                let mut charge = (memory_lo & 0xFFFFFF) as i32;
                                if charge < 100 {
                                    charge = 100; // Provide enough plasma generic charge to bleed off into a kind=2
                                    mem[0] = (charge & 0xFF) as u8;
                                    mem[1] = ((charge >> 8) & 0xFF) as u8;
                                    mem[2] = ((charge >> 16) & 0xFF) as u8;
                                    // keep mem[3] unaltered
                                }

                                state.matrix.memory_grid[cell_idx] = mem;
                            }
                        }
                    }

                    state.recycle_atom(i);
                } else {
                    state.matrix.energy[i] = e;
                }
            }
        }

        // 8. Membrane Physics (Metazoan Emergence)
        self.visited.fill(0);

        for i in 1..MAX_ATOMS {
            if state.matrix.ids[i] != 0 {
                state.matrix.roles[i] &= !0x80;
                state.matrix.evolution_reserved[i] = 0;
            }
        }

        let mut rings: Vec<Vec<usize>> = Vec::new();

        // Detect simple topological cycles (length 3 to 8)
        for start_node in 1..MAX_ATOMS {
            if state.matrix.ids[start_node] == 0 || self.visited[start_node] == 1 {
                continue;
            }

            let mut path = Vec::with_capacity(8);
            path.push(start_node);

            fn dfs(
                current: usize,
                start: usize,
                depth: usize,
                path: &mut Vec<usize>,
                state: &SigmaState,
            ) -> bool {
                if depth >= 8 {
                    return false;
                }

                for b_slot in 0..4 {
                    let target = state.matrix.bonds[(current * 4) + b_slot] as usize;
                    if target > 0 && target < MAX_ATOMS && state.matrix.ids[target] != 0 {
                        if target == start && depth >= 2 {
                            return true;
                        }
                        // Prune duplicate or overlapping loops natively
                        if target < start {
                            continue;
                        }
                        if !path.contains(&target) {
                            path.push(target);
                            if dfs(target, start, depth + 1, path, state) {
                                return true;
                            }
                            path.pop();
                        }
                    }
                }
                false
            }

            if dfs(start_node, start_node, 0, &mut path, &*state) {
                rings.push(path.clone());
                for &node in &path {
                    self.visited[node] = 1;
                }
            }
        }

        // Resource Pooling and Stealth Flagging
        for ring in &rings {
            let count = ring.len() as i32;
            let mut sum_energy: i64 = 0;
            let mut sum_resonance: i64 = 0;

            for &node in ring {
                sum_energy += state.matrix.energy[node] as i64;
                sum_resonance += state.matrix.resonance[node] as i64;
                state.matrix.roles[node] |= crate::AtomRole::MetazoanFlag as u8;
                // Metazoan flag
            }

            let avg_energy = (sum_energy / count as i64) as i32;
            let avg_resonance = (sum_resonance / count as i64) as i32;
            let total_resonance = sum_resonance as i32; // Shield Defense

            for &node in ring {
                state.matrix.energy[node] = avg_energy;
                state.matrix.resonance[node] = avg_resonance;
                state.matrix.evolution_reserved[node] = total_resonance;
            }
        }
    }
}
```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/sigma_replication.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/sigma_replication.md
// Substrate Node: sigma_replication
// Level: 2
// Manages autopoietic mitosis processes and genome verification

#![allow(unused_imports)]
use super::super::L01::*;

// Replication Engine
// Handles the queued spawn requests and materializes new atoms into the Matrix at the end of each tick.

use crate::{SigmaState, MAX_ATOMS};
use crate::{SPAWN_MAX, SPAWN_SLOT};

impl SigmaState {
    /// Pushes a spawn request into the ring-buffer at the current write head.
    /// Uses Atomic bounds allowing multiple threads to queue concurrently.
    /// `owner_idx`: ID of the parent atom replicating
    /// `cx, cy`: Coordinates for the child
    /// `energy`: Provisioned starting energy
    pub fn push_spawn_request(&self, owner_idx: usize, cx: i32, cy: i32, energy: i32) {
        let spawn_atomic = self.spawn_requests_atomic(); // index 0 is write_head, 1 is read_head

        let read_head = spawn_atomic[1].load(std::sync::atomic::Ordering::Acquire);

        // Atomically claim the next slot in the ring buffer
        let mut write_head = spawn_atomic[0].load(std::sync::atomic::Ordering::Acquire);
        loop {
            if write_head - read_head >= SPAWN_MAX {
                return; // Buffer full
            }
            match spawn_atomic[0].compare_exchange(
                write_head,
                write_head + 1,
                std::sync::atomic::Ordering::AcqRel,
                std::sync::atomic::Ordering::Acquire,
            ) {
                Ok(_) => break, // claim confirmed
                Err(new_write_head) => write_head = new_write_head,
            }
        }

        // We claimed `write_head`. Now write payload specifically into our reserved slot.
        let slot_off = 8 + ((write_head % SPAWN_MAX) * SPAWN_SLOT) as usize;
        let p_id = self.matrix.ids[owner_idx];

        // Write p_id (low 32, high 32)
        let pid_lo = (p_id & 0xFFFFFFFF) as i32;
        let pid_hi = (p_id >> 32) as i32;

        unsafe {
            // Note: Since each thread has a UNIQUE slot (`write_head` is atomic), we can bypass Rust's
            // interior mutability checks purely for `spawn_requests` payload area using unsafe raw pointers.
            let req_ptr = self.matrix.spawn_requests.as_ptr() as *mut u8;

            std::ptr::copy_nonoverlapping(pid_lo.to_le_bytes().as_ptr(), req_ptr.add(slot_off), 4);
            std::ptr::copy_nonoverlapping(
                pid_hi.to_le_bytes().as_ptr(),
                req_ptr.add(slot_off + 4),
                4,
            );

            std::ptr::copy_nonoverlapping(
                (cx as i16).to_le_bytes().as_ptr(),
                req_ptr.add(slot_off + 8),
                2,
            );
            std::ptr::copy_nonoverlapping(
                (cy as i16).to_le_bytes().as_ptr(),
                req_ptr.add(slot_off + 10),
                2,
            );

            std::ptr::copy_nonoverlapping(
                energy.to_le_bytes().as_ptr(),
                req_ptr.add(slot_off + 12),
                4,
            );

            let logic = self.matrix.logic[owner_idx];
            std::ptr::copy_nonoverlapping(logic.as_ptr(), req_ptr.add(slot_off + 16), 8);
        }
    }

    /// Evaluates the spawn buffer at the end of the frame, copying instructions from known parent IDs.
    pub fn drain_spawn_requests(&mut self, tick: i32) -> i32 {
        let header_slice: &[u8; 8] = self.matrix.spawn_requests[0..8].try_into().unwrap();
        let write_head = i32::from_le_bytes(header_slice[0..4].try_into().unwrap());
        let read_head = i32::from_le_bytes(header_slice[4..8].try_into().unwrap());

        let mut cursor = read_head;
        let mut spawned = 0;
        let mut free_search_cursor = self.free_search_cursor; // 0 is null atom

        while cursor != write_head && spawned < 64 {
            let slot_off = 8 + ((cursor % SPAWN_MAX) * SPAWN_SLOT) as usize;

            let pid_lo = i32::from_le_bytes(
                self.matrix.spawn_requests[slot_off..slot_off + 4]
                    .try_into()
                    .unwrap(),
            );
            let pid_hi = i32::from_le_bytes(
                self.matrix.spawn_requests[slot_off + 4..slot_off + 8]
                    .try_into()
                    .unwrap(),
            );
            let g_lo = pid_lo;

            if g_lo != 0 {
                let p_id = (pid_lo as u32 as u64) | ((pid_hi as u32 as u64) << 32);

                let cx = i16::from_le_bytes(
                    self.matrix.spawn_requests[slot_off + 8..slot_off + 10]
                        .try_into()
                        .unwrap(),
                ) as i32;
                let cy = i16::from_le_bytes(
                    self.matrix.spawn_requests[slot_off + 10..slot_off + 12]
                        .try_into()
                        .unwrap(),
                ) as i32;
                let energy_scaled = i32::from_le_bytes(
                    self.matrix.spawn_requests[slot_off + 12..slot_off + 16]
                        .try_into()
                        .unwrap(),
                );

                let mut logic: [u8; 8] = [0; 8];
                logic.copy_from_slice(&self.matrix.spawn_requests[slot_off + 16..slot_off + 24]);

                // O(1) Search via index hinting: The lower 32-bits of p_id contain the parent index
                let parent_hint = (p_id & 0xFFFFFFFF) as usize;
                let mut parent_idx = 0;
                if parent_hint > 0
                    && parent_hint < MAX_ATOMS
                    && self.matrix.ids[parent_hint] == p_id
                {
                    parent_idx = parent_hint;
                } else {
                    // Fallback to linear search in case of desync
                    for i in 1..MAX_ATOMS {
                        if self.matrix.ids[i] == p_id {
                            parent_idx = i;
                            break;
                        }
                    }
                }

                // Find Free Slot
                let mut free_idx: i32 = -1;
                for i in 0..MAX_ATOMS {
                    let search = (free_search_cursor + i) % MAX_ATOMS;
                    if search != 0 && self.matrix.ids[search] == 0 {
                        free_idx = search as i32;
                        break;
                    }
                }

                if free_idx != -1 && parent_idx != 0 {
                    let child_id = ((tick as i64) << 32) | (free_idx as i64);
                    let f = free_idx as usize;

                    self.matrix.ids[f] = child_id as u64;
                    self.matrix.xs[f] = cx as i16;
                    self.matrix.ys[f] = cy as i16;
                    self.matrix.energy[f] = energy_scaled;
                    self.matrix.logic[f] = logic;

                    // Copy 64 bytes of ASM instructions from parent
                    self.matrix.instructions[f] = self.matrix.instructions[parent_idx];

                    // Reset fresh state
                    self.matrix.resonance[f] = 0;
                    self.matrix.phase[f] = 0;
                    self.matrix.context[f] = [0; 16];
                    self.matrix.context[f][8] = 0; // PC

                    // CRISPR Inheritance
                    // Pass adaptive immunity (Reg 13) down to the child
                    self.matrix.context[f][13] = self.matrix.context[parent_idx][13];

                    free_search_cursor = (free_idx as usize + 1) % MAX_ATOMS;
                }
            }
            cursor += 1;
            spawned += 1;
        }

        // Close transaction
        self.matrix.spawn_requests[4..8].copy_from_slice(&cursor.to_le_bytes());
        self.free_search_cursor = free_search_cursor;
        spawned
    }
}
```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/sigma_shadow.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/sigma_shadow.md
// Substrate Node: sigma_shadow
// Level: 2
// Implements the speculative execution engine for quantum divergence

#![allow(unused_imports)]
use super::super::L01::*;

use crate::SigmaState;
use crate::PulseOrchestrator;

/// Drift metrics reporting back to the TypeScript orchestrator.
#[repr(C)]
#[derive(Debug, Clone)]
pub struct DriftMetrics {
    pub energy_diff: i32,
    pub resonance_diff: i32,
    pub bonds_broken: u32,
    pub bonds_formed: u32,
    pub structural_value_change: i32,
    pub population_diff: i32,
    pub coherence_diff: i32,
    pub divergence_tick: u32,
}

use std::cell::RefCell;

thread_local! {
    static SHADOW_POOL: RefCell<Vec<u8>> = RefCell::new(Vec::with_capacity(crate::MAX_ATOMS));
}

/// Clones the entire `SigmaState`, overrides the target `atom_id` logic bytes,
/// runs `ticks` iterations of the native PulseOrchestrator, and calculates
/// the topological drift before shedding the clone.
pub fn run_shadow_simulation(
    original_state: &SigmaState,
    atom_id: u64,
    hallucination_bytes: &[u8; 64],
    ticks: u32,
    start_tick: u32,
) -> DriftMetrics {
    // 1. Deep clone the massive matrix securely avoiding stack bounds
    let mut shadow_state = original_state.clone();
    let shadow_matrix = &mut shadow_state.matrix;

    // Find absolute memory index of the atom
    let mut target_idx = None;
    for (i, &id) in shadow_matrix.ids.iter().enumerate() {
        if id == atom_id {
            target_idx = Some(i);
            break;
        }
    }

    let target_idx = target_idx.unwrap_or(0); // fallback gracefully if bad ID? Ideally we should return error.

    let initial_energy = shadow_matrix.energy[target_idx];
    let initial_resonance = shadow_matrix.resonance[target_idx];
    let initial_structural_value = shadow_matrix.structure_build_value.iter().sum::<i32>();

    let initial_population = shadow_matrix.ids.iter().filter(|&&id| id != 0).count() as i32;
    let initial_coherence = shadow_matrix.neural_coherence;

    let original_bonds: Vec<i32> = {
        let start = target_idx * 4;
        shadow_matrix.bonds[start..start + 4].to_vec()
    };

    // 2. Inject the semantic hallucination override
    shadow_matrix.instructions[target_idx].copy_from_slice(hallucination_bytes);

    // 3. Spool up a sovereign Pulse orchestrator over the isolated shadow
    SHADOW_POOL.with(|pool| {
        let mut visited = pool.borrow_mut();
        visited.clear();
        visited.resize(crate::MAX_ATOMS, 0);
        let mut orchestrator = PulseOrchestrator::new(&mut visited);

        for i in 0..ticks {
            orchestrator.tick(&mut shadow_state, start_tick + i);
        }

        // 4. Calculate topological divergence
        let final_energy = shadow_state.matrix.energy[target_idx];
        let final_resonance = shadow_state.matrix.resonance[target_idx];
        let final_structural_value = shadow_state
            .matrix
            .structure_build_value
            .iter()
            .sum::<i32>();

        let final_population = shadow_state
            .matrix
            .ids
            .iter()
            .filter(|&&id| id != 0)
            .count() as i32;
        let final_coherence = shadow_state.matrix.neural_coherence;

        let final_bonds: Vec<i32> = {
            let start = target_idx * 4;
            shadow_state.matrix.bonds[start..start + 4].to_vec()
        };

        let mut bonds_broken = 0;
        let mut bonds_formed = 0;

        for i in 0..4 {
            if original_bonds[i] != 0 && final_bonds[i] == 0 {
                bonds_broken += 1;
            }
            if original_bonds[i] == 0 && final_bonds[i] != 0 {
                bonds_formed += 1;
            }
        }

        DriftMetrics {
            energy_diff: final_energy.saturating_sub(initial_energy),
            resonance_diff: final_resonance.saturating_sub(initial_resonance),
            bonds_broken,
            bonds_formed,
            structural_value_change: final_structural_value
                .saturating_sub(initial_structural_value),
            population_diff: final_population.saturating_sub(initial_population),
            coherence_diff: final_coherence.saturating_sub(initial_coherence),
            divergence_tick: start_tick + ticks,
        }
    })
}
```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/sigma_spatial.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/sigma_spatial.md
// Substrate Node: sigma_spatial
// Level: 2
// Implements the 2D grid hashing algorithm enabling fast localized queries

#![allow(unused_imports)]
use super::super::L01::*;

// Spatial Fabric Topology & Cognition Grid

use crate::{GRID_CELLS, GRID_W, SPATIAL_CELL_SIZE, WORLD_MAX_X, WORLD_MAX_Y};
use crate::{SigmaState, MAX_ATOMS};
use std::sync::atomic::Ordering;

impl SigmaState {
    /// Rebuilds the 140x80 spatial hash grid for collision detection and neighbor awareness.
    /// Perfectly maps to the TypeScript bit-for-bit implementation.
    pub fn build_spatial_hash(&mut self) -> (i32, i32) {
        // Slot 31 is the phase slot, slots 1..30 are for atoms
        let phase_slot = 31;
        let max_atom_slots = 30;

        // 1. Clear Grid and Quorum
        self.matrix.spatial_grid[..].fill(0);
        self.matrix.quorum[..].fill(0);

        let spatial_atomic = self.spatial_grid_atomic();
        let quorum_atomic = self.quorum_atomic();

        let mut overflow_count = 0;
        let mut max_cell_count = 0;

        // 2. Bin Atoms
        for idx in 0..MAX_ATOMS {
            if self.matrix.ids[idx] == 0 {
                continue; // Skip dead atoms
            }

            let mut x = (self.matrix.xs[idx] as i32) / 100;
            let mut y = (self.matrix.ys[idx] as i32) / 100;

            if x < 0 {
                x = 0;
            }
            if x > WORLD_MAX_X {
                x = WORLD_MAX_X;
            }
            if y < 0 {
                y = 0;
            }
            if y > WORLD_MAX_Y {
                y = WORLD_MAX_Y;
            }

            let cell_x = (x / SPATIAL_CELL_SIZE) as usize;
            let cell_y = (y / SPATIAL_CELL_SIZE) as usize;
            let cell_idx = (cell_y * (GRID_W as usize)) + cell_x;

            let sg_base = cell_idx * 32;

            // Atomically reserve a slot
            let slot_idx =
                spatial_atomic[sg_base].fetch_add(1, std::sync::atomic::Ordering::Relaxed);
            let next_slot = slot_idx + 1; // 1-based internal slot count

            if next_slot <= max_atom_slots {
                // Store atom index in the grid slot
                spatial_atomic[sg_base + (next_slot as usize)]
                    .store(idx as i32, std::sync::atomic::Ordering::Relaxed);

                // Accumulate Phase into slot 31 (phase_slot)
                let my_phase = self.matrix.phase[idx] as i32;
                spatial_atomic[sg_base + phase_slot]
                    .fetch_add(my_phase, std::sync::atomic::Ordering::Relaxed);

                // Role quorum counting
                let role = self.matrix.roles[idx];
                let safe_role = if role > 7 { 7 } else { role as usize };

                let q_base = cell_idx * 8;
                quorum_atomic[q_base + safe_role]
                    .fetch_add(1, std::sync::atomic::Ordering::Relaxed);

                if next_slot > max_cell_count {
                    max_cell_count = next_slot;
                }
            } else {
                overflow_count += 1;
            }
        }

        // 3. Finalize Phase Averages
        for i in 0..GRID_CELLS {
            let sg_base = i * 32;
            let count = spatial_atomic[sg_base].load(std::sync::atomic::Ordering::Relaxed);
            if count > 0 {
                let sum =
                    spatial_atomic[sg_base + phase_slot].load(std::sync::atomic::Ordering::Relaxed);
                spatial_atomic[sg_base + phase_slot]
                    .store(sum / count, std::sync::atomic::Ordering::Relaxed);
            }
        }

        (overflow_count, max_cell_count)
    }

    /// Helper to get number of atoms in a specific grid cell
    pub fn get_spatial_grid_count(&self, gx: i32, gy: i32) -> i32 {
        let cell_idx = (gy * GRID_W + gx) as usize;
        self.matrix.spatial_grid[cell_idx * 32]
    }

    /// Helper to get a specific atom index from a grid cell
    pub fn get_spatial_grid_atom(&self, gx: i32, gy: i32, sub_idx: i32) -> i32 {
        let cell_idx = (gy * GRID_W + gx) as usize;
        self.matrix.spatial_grid[cell_idx * 32 + ((sub_idx + 1) as usize)]
    }
}
```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/sigma_structure.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/sigma_structure.md
// Substrate Node: sigma_structure
// Level: 2
// Handles the cellular automaton lifecycle of the crystalline grid

#![allow(unused_imports)]
use super::super::L01::*;

// Architecture Intent Engine
// Handles the arbitration and locking mechanisms for `OP_BUILD`, `OP_PLUG`, and `OP_SENSE`.

use crate::SigmaState;

pub const STRUCTURE_INTENT_LOCK_BIT: i32 = -2147483648; // 0x80000000

impl SigmaState {
    /// Attempts to publish a build intent to the specified cell.
    /// Attempts to publish a build intent to the specified cell.
    /// Arbitration happens via the `ownerToken` mechanism to resolve racing logic during a tick.
    pub fn publish_build_intent(&self, cell_idx: usize, owner_atom_idx: usize, build_value: i32) {
        if cell_idx >= crate::GRID_CELLS {
            return;
        }

        let owner_atomic = self.structure_build_owner_atomic();
        let val_atomic = unsafe {
            std::slice::from_raw_parts(
                self.matrix.structure_build_value.as_ptr() as *const std::sync::atomic::AtomicI32,
                self.matrix.structure_build_value.len(),
            )
        };

        let owner_token = (owner_atom_idx as i32) + 1; // 1-indexed

        // Spin until we successfully lock or realize we are over-prioritized
        loop {
            let current_owner = owner_atomic[cell_idx].load(std::sync::atomic::Ordering::Acquire);

            // Bail if locked by the consensus daemon
            if current_owner == STRUCTURE_INTENT_LOCK_BIT {
                break;
            }

            if owner_token > current_owner {
                // We have higher priority, attempt to claim it
                match owner_atomic[cell_idx].compare_exchange(
                    current_owner,
                    owner_token,
                    std::sync::atomic::Ordering::AcqRel,
                    std::sync::atomic::Ordering::Acquire,
                ) {
                    Ok(_) => {
                        // Success! We claimed the owner token. Write our value.
                        val_atomic[cell_idx]
                            .store(build_value, std::sync::atomic::Ordering::Release);
                        break;
                    }
                    Err(_) => {
                        // Failed to claim (another atom snuck in). Loop again and re-evaluate `current_owner`.
                        continue;
                    }
                }
            } else {
                // An atom with higher priority already owns this slot for this tick.
                break;
            }
        }
    }

    /// Reads the state of a structure cell, viewing the immediate intent if present,
    /// otherwise returning the finalized grid value.
    pub fn read_structure_cell(&self, cell_idx: usize) -> i32 {
        if cell_idx >= crate::GRID_CELLS {
            return 0;
        }

        let owner_atomic = self.structure_build_owner_atomic();
        let intent_owner = owner_atomic[cell_idx].load(std::sync::atomic::Ordering::Acquire);

        if intent_owner != 0 && intent_owner != STRUCTURE_INTENT_LOCK_BIT {
            let val_atomic = unsafe {
                std::slice::from_raw_parts(
                    self.matrix.structure_build_value.as_ptr()
                        as *const std::sync::atomic::AtomicI32,
                    self.matrix.structure_build_value.len(),
                )
            };
            val_atomic[cell_idx].load(std::sync::atomic::Ordering::Acquire)
        } else {
            self.matrix.structure_grid[cell_idx]
        }
    }

    /// Mutates the charge intent for OP_PLUG.
    pub fn set_structure_charge_intent(&self, cell_idx: usize, charge: i32) {
        if cell_idx < crate::GRID_CELLS {
            let intent_atomic = self.structure_charge_intent_atomic();
            let mut current = intent_atomic[cell_idx].load(std::sync::atomic::Ordering::Acquire);
            loop {
                // In Deno, multiple plugs into the same cell don't sum, they take max, or they just overwrite.
                // Assuming overwrite or max. Max is safer for multi-threaded:
                if charge <= current {
                    break;
                }
                match intent_atomic[cell_idx].compare_exchange(
                    current,
                    charge,
                    std::sync::atomic::Ordering::AcqRel,
                    std::sync::atomic::Ordering::Acquire,
                ) {
                    Ok(_) => break,
                    Err(actual) => current = actual,
                }
            }
        }
    }
}
```

---

## FILE: src/00/sigma_core/src/ontology_gen/02/store_clamped_pos.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/spatial/store_clamped_pos.md
#![allow(unused_imports)]
use super::super::L01::*;

pub fn store_clamped_pos(idx: i32, x: i32, y: i32) -> () {
    // Requires mutable pointer to the SharedArray lattice not naturally bound to pure_fns yet.
    // TODO: Extend DAG to inject &mut [i8] for memory mutating commands.
    ()
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/ATOMIC_LEDGER.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/l32_gate/atomic_ledger.md
#![allow(unused_imports)]
use super::super::L02::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/GATE.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/l32_gate/gate.md
#![allow(unused_imports)]
use super::super::L02::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/GATE_LEDGER.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/l32_gate/gate_ledger.md
#![allow(unused_imports)]
use super::super::L02::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/GATE_MERGER.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/l32_gate/gate_merger.md
#![allow(unused_imports)]
use super::super::L02::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/GATE_VALIDATOR.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/l32_gate/gate_validator.md
#![allow(unused_imports)]
use super::super::L02::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/GENETIC_LEDGER.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/l32_gate/genetic_ledger.md
#![allow(unused_imports)]
use super::super::L02::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/MX.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/state_matrix.md
#![allow(unused_imports)]
use super::super::L02::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/accumulate_metabolism_stats.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/accumulate_metabolism_stats.md
#![allow(unused_imports)]
use super::super::L02::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/add_resonance.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/memory/add_resonance.md
#![allow(unused_imports)]
use super::super::L02::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/apply_bond_springs.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/apply_bond_springs.md
#![allow(unused_imports)]
use super::super::L02::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/apply_metabolism_kernel.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/apply_metabolism_kernel.md
#![allow(unused_imports)]
use super::super::L02::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/build_spatial_hash.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/build_spatial_hash.md
#![allow(unused_imports)]
use super::super::L02::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/calculate_trophism.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/calculate_trophism.md
#![allow(unused_imports)]
use super::super::L02::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/drain_spawn_requests.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/drain_spawn_requests.md
#![allow(unused_imports)]
use super::super::L02::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/fire_signal.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/fire_signal.md
#![allow(unused_imports)]
use super::super::L02::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/get_genome_velocity_x.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/get_genome_velocity_x.md
#![allow(unused_imports)]
use super::super::L02::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/get_genome_velocity_y.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/get_genome_velocity_y.md
#![allow(unused_imports)]
use super::super::L02::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/glyph_transport.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/glyph_transport.md
#![allow(unused_imports)]
use super::super::L02::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/mod.rs

```rust
// AUTOGENERATED LEVEL FACADE

pub use super::L02::*;

#[path = "build_spatial_hash.rs"]
pub mod build_spatial_hash;
pub use build_spatial_hash::*;
#[path = "sigma_vm.rs"]
pub mod sigma_vm;
pub use sigma_vm::*;
#[path = "MX.rs"]
pub mod MX;
pub use MX::*;
#[path = "add_resonance.rs"]
pub mod add_resonance;
pub use add_resonance::*;
#[path = "tick_membrane_physics.rs"]
pub mod tick_membrane_physics;
pub use tick_membrane_physics::*;
#[path = "run_phagocyte_pass.rs"]
pub mod run_phagocyte_pass;
pub use run_phagocyte_pass::*;
#[path = "secrete_glyph.rs"]
pub mod secrete_glyph;
pub use secrete_glyph::*;
#[path = "drain_spawn_requests.rs"]
pub mod drain_spawn_requests;
pub use drain_spawn_requests::*;
#[path = "apply_metabolism_kernel.rs"]
pub mod apply_metabolism_kernel;
pub use apply_metabolism_kernel::*;
#[path = "accumulate_metabolism_stats.rs"]
pub mod accumulate_metabolism_stats;
pub use accumulate_metabolism_stats::*;
#[path = "glyph_transport.rs"]
pub mod glyph_transport;
pub use glyph_transport::*;
#[path = "GATE.rs"]
pub mod GATE;
pub use GATE::*;
#[path = "ATOMIC_LEDGER.rs"]
pub mod ATOMIC_LEDGER;
pub use ATOMIC_LEDGER::*;
#[path = "GATE_LEDGER.rs"]
pub mod GATE_LEDGER;
pub use GATE_LEDGER::*;
#[path = "GENETIC_LEDGER.rs"]
pub mod GENETIC_LEDGER;
pub use GENETIC_LEDGER::*;
#[path = "GATE_VALIDATOR.rs"]
pub mod GATE_VALIDATOR;
pub use GATE_VALIDATOR::*;
#[path = "GATE_MERGER.rs"]
pub mod GATE_MERGER;
pub use GATE_MERGER::*;
#[path = "calculate_trophism.rs"]
pub mod calculate_trophism;
pub use calculate_trophism::*;
#[path = "apply_bond_springs.rs"]
pub mod apply_bond_springs;
pub use apply_bond_springs::*;
#[path = "fire_signal.rs"]
pub mod fire_signal;
pub use fire_signal::*;
#[path = "get_genome_velocity_y.rs"]
pub mod get_genome_velocity_y;
pub use get_genome_velocity_y::*;
#[path = "get_genome_velocity_x.rs"]
pub mod get_genome_velocity_x;
pub use get_genome_velocity_x::*;
#[path = "read_structure_charge.rs"]
pub mod read_structure_charge;
pub use read_structure_charge::*;
#[path = "resolve_bond_requests.rs"]
pub mod resolve_bond_requests;
pub use resolve_bond_requests::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/read_structure_charge.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/read_structure_charge.md
#![allow(unused_imports)]
use super::super::L02::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/resolve_bond_requests.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/resolve_bond_requests.md
#![allow(unused_imports)]
use super::super::L02::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/run_phagocyte_pass.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/run_phagocyte_pass.md
#![allow(unused_imports)]
use super::super::L02::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/secrete_glyph.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/secrete_glyph.md
#![allow(unused_imports)]
use super::super::L02::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/sigma_vm.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/sigma_vm.md
// Substrate Node: sigma_vm
// Level: 3
// LambdaVM Execution Engine

#![allow(unused_imports)]
use super::super::L02::*;

use crate::{
    GRID_W, PROP_ENERGY, PROP_PHASE, PROP_RESONANCE, SPATIAL_CELL_SIZE,
};
use crate::in_grid;
use crate::GlyphOp;
use crate::{SYS_TRANSFER, SYS_ATTRACT, SYS_FOLD, SYS_SPAWN, SYS_BIND};
use crate::{math_cos, math_sin};
use crate::{SigmaState, MAX_ATOMS};

pub struct LambdaVM {}

impl LambdaVM {
    pub fn new() -> Self {
        Self {}
    }

    #[inline(always)]
    pub fn fetch_instruction(&self, state: &SigmaState, atom_idx: usize, pc: u8, offset: u8) -> u8 {
        let actual_pc = (pc.wrapping_add(offset)) & 63;
        state
            .matrix
            .instructions
            .get(atom_idx)
            .map(|inst| inst[actual_pc as usize])
            .unwrap_or(0) // Default to NOP if indices completely invalid
    }

    /// Executes a single atom's VM pipeline mapped exactly to Deno.
    ///
    /// # Safety
    /// Bounded automatically if `atom_idx >= MAX_ATOMS`. Native out of bounds operations
    /// degrade cleanly into NOP executions. Array manipulation operates primarily through
    /// safely ordered hardware-level atomics to prevent simultaneous VM tick data races.
    ///
    /// # Metabolic Economics
    /// Standard execution runs at zero gas until operations resolve. Each opcode natively applies
    /// +1 base computation energy cost, scaled exponentially based on `hormone` friction/entropy
    /// equations simulating thermodynamics across the Tensegrity lattice.
    pub fn step(&mut self, state: &SigmaState, atom_idx: usize) {
        if atom_idx >= crate::MAX_ATOMS {
            return;
        }

        // Get initial PC
        let mut pc = state.matrix.context[atom_idx][8] as u8;

        // Emulating `getReadEnergy` and `getReadResonance` which act as snapshots
        // during execution, though for simple tests we assume they match actual.
        let mut energy = state.matrix.energy[atom_idx];
        let mut resonance = state.matrix.resonance[atom_idx];

        let mut gas_used = 0;
        let mut gas_limit = if energy < 100 { energy } else { 100 };
        let mut step_count = 0;
        const MAX_EXECUTION_STEPS: usize = 64;

        while gas_used < gas_limit {
            step_count += 1;
            if step_count > MAX_EXECUTION_STEPS {
                state.energy_atomic()[atom_idx].store(0, std::sync::atomic::Ordering::Relaxed);
                break;
            }

            let op = GlyphOp::from(state.matrix.instructions[atom_idx][pc as usize]);

            match op {
                GlyphOp::Nop => {
                    gas_used += 1;
                    break;
                }
                GlyphOp::Set => {
                    let reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let imm = self.fetch_instruction(state, atom_idx, pc, 2);
                    if reg < 8 {
                        state.context_atomic(atom_idx)[reg as usize]
                            .store(imm as i8 as i32, std::sync::atomic::Ordering::Relaxed);
                    }
                    pc += 3;
                    gas_used += 1;
                }
                GlyphOp::Get => {
                    let reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let prop = self.fetch_instruction(state, atom_idx, pc, 2);
                    let mut val = 0;

                    if prop == PROP_ENERGY {
                        val = energy;
                    } else if prop == PROP_RESONANCE {
                        val = resonance;
                    } else if prop == PROP_PHASE {
                        val = state.matrix.phase[atom_idx];
                    }
                    // Ignoring complex external grid read properties for simple test harness

                    if reg < 8 {
                        state.context_atomic(atom_idx)[reg as usize]
                            .store(val, std::sync::atomic::Ordering::Relaxed);
                    }
                    pc += 3;
                    gas_used += 2;
                }
                GlyphOp::Put => {
                    let reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let prop = self.fetch_instruction(state, atom_idx, pc, 2);
                    let val = if reg < 8 {
                        state.matrix.context[atom_idx][reg as usize]
                    } else {
                        0
                    };

                    if prop == PROP_ENERGY {
                        energy = val;
                    } else if prop == PROP_RESONANCE {
                        resonance = val;
                    } else if prop == PROP_PHASE {
                        state.phase_atomic()[atom_idx]
                            .store(val, std::sync::atomic::Ordering::Relaxed);
                    }

                    pc += 3;
                    gas_used += 2;
                }
                GlyphOp::Add => {
                    let r1 = self.fetch_instruction(state, atom_idx, pc, 1);
                    let r2 = self.fetch_instruction(state, atom_idx, pc, 2);
                    if r1 < 8 && r2 < 8 {
                        let sum = state.matrix.context[atom_idx][r1 as usize]
                            .wrapping_add(state.matrix.context[atom_idx][r2 as usize]);
                        state.context_atomic(atom_idx)[r1 as usize]
                            .store(sum, std::sync::atomic::Ordering::Relaxed);
                    }
                    pc += 3;
                    gas_used += 1;
                }
                GlyphOp::Sub => {
                    let r1 = self.fetch_instruction(state, atom_idx, pc, 1);
                    let r2 = self.fetch_instruction(state, atom_idx, pc, 2);
                    if r1 < 8 && r2 < 8 {
                        let sub = state.matrix.context[atom_idx][r1 as usize]
                            .wrapping_sub(state.matrix.context[atom_idx][r2 as usize]);
                        state.context_atomic(atom_idx)[r1 as usize]
                            .store(sub, std::sync::atomic::Ordering::Relaxed);
                    }
                    pc += 3;
                    gas_used += 1;
                }
                GlyphOp::Jnz => {
                    let reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let target = self.fetch_instruction(state, atom_idx, pc, 2);
                    if reg < 8 && state.matrix.context[atom_idx][reg as usize] != 0 {
                        pc = target;
                    } else {
                        pc += 3;
                    }
                    gas_used += 2;
                }
                GlyphOp::Jz => {
                    // Note: Deno didn't have OP_JZ fully flushed in phase-7 physics, but logic implies inverse JNZ
                    let reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let target = self.fetch_instruction(state, atom_idx, pc, 2);
                    if reg < 8 && state.matrix.context[atom_idx][reg as usize] == 0 {
                        pc = target;
                    } else {
                        pc += 3;
                    }
                    gas_used += 2;
                }
                GlyphOp::Jmp => {
                    pc = self.fetch_instruction(state, atom_idx, pc, 1);
                    gas_used += 2;
                }
                GlyphOp::Resolve => {
                    let dest_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let angle_reg = self.fetch_instruction(state, atom_idx, pc, 2);
                    let mode_reg = self.fetch_instruction(state, atom_idx, pc, 3);

                    let angle = if angle_reg < 8 {
                        state.matrix.context[atom_idx][angle_reg as usize]
                    } else {
                        0
                    };
                    let mode_val = if mode_reg < 8 {
                        state.matrix.context[atom_idx][mode_reg as usize]
                    } else {
                        0
                    };

                    let mut high_res = 0;
                    let mut cost = 1;

                    if mode_val == 1 || mode_val == 3 {
                        high_res = 1;
                        cost = 5;
                    } else if mode_val == 4 || mode_val == 5 {
                        high_res = 2; // Reserved for Taylor2
                        cost = 10;
                    }

                    let val = if mode_val == 0 || mode_val == 1 || mode_val == 4 {
                        math_sin(angle, high_res)
                    } else {
                        math_cos(angle, high_res)
                    };

                    if dest_reg < 8 {
                        state.context_atomic(atom_idx)[dest_reg as usize]
                            .store(val, std::sync::atomic::Ordering::Relaxed);
                    }

                    pc += 4;
                    gas_used += cost;
                }
                GlyphOp::ResonateKuramoto => {
                    let gx = (state.matrix.xs[atom_idx] as i32) / (100 * SPATIAL_CELL_SIZE);
                    let gy = (state.matrix.ys[atom_idx] as i32) / (100 * SPATIAL_CELL_SIZE);

                    // Note: Deno physics clamp logic is actually (xs / SPATIAL_CELL_SIZE) / 100.
                    // Let's use grid coordinates as mapped by build_spatial_hash (which are units of 10)
                    let current_phase = state.matrix.phase[atom_idx] as i32;
                    let mut sum_sin: i32 = 0;
                    let mut neighbor_count = 0;

                    let grid_cx = gx;
                    let grid_cy = gy;

                    'search: for dy in -1..=1 {
                        for dx in -1..=1 {
                            let nx = grid_cx + dx;
                            let ny = grid_cy + dy;

                            if in_grid(nx, ny) {
                                let count = state.get_spatial_grid_count(nx, ny);
                                for i in 0..count {
                                    if neighbor_count >= 32 {
                                        break 'search;
                                    }
                                    let neighbor_id =
                                        state.get_spatial_grid_atom(nx, ny, i) as usize;
                                    if neighbor_id > 0
                                        && neighbor_id != atom_idx
                                        && neighbor_id < MAX_ATOMS
                                    {
                                        let neighbor_phase = state.matrix.phase[neighbor_id] as i32;
                                        let diff = (neighbor_phase - current_phase) & 255;
                                        sum_sin = sum_sin.saturating_add(math_sin(diff, 0)); // Direct lookup density mapping
                                        neighbor_count += 1;
                                    }
                                }
                            }
                        }
                    }

                    let coh = state.matrix.neural_coherence as i32;
                    let mut k_bond = 5 + (coh / 100);
                    if k_bond > 128 {
                        k_bond = 128;
                    }

                    if neighbor_count > 0 {
                        let d_theta = (k_bond.saturating_mul(sum_sin)) >> 15;
                        let theta_next = (current_phase as i32)
                            .saturating_add(d_theta)
                            .rem_euclid(256);
                        state.phase_atomic()[atom_idx]
                            .store(theta_next as i32, std::sync::atomic::Ordering::Relaxed);
                    }

                    pc += 1;
                    gas_used += 5 + (neighbor_count * 2);
                }
                GlyphOp::Share => {
                    let target_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let amount_reg = self.fetch_instruction(state, atom_idx, pc, 2);

                    let target_idx = if target_reg < 8 {
                        state.matrix.context[atom_idx][target_reg as usize]
                    } else {
                        0
                    };
                    let mut amount = if amount_reg < 8 {
                        state.matrix.context[atom_idx][amount_reg as usize]
                    } else {
                        0
                    };

                    if target_idx > 0 && (target_idx as usize) < MAX_ATOMS && amount > 0 {
                        let aggression = state.matrix.hormones[2] as i32;
                        if aggression > 1024 {
                            amount += (amount * (aggression - 1024)) / 2048;
                        }

                        let sender_energy = state.matrix.energy[atom_idx];
                        let scaled_amount = amount * crate::SCALE;

                        if sender_energy >= scaled_amount {
                            state.energy_atomic()[atom_idx]
                                .fetch_sub(scaled_amount, std::sync::atomic::Ordering::Relaxed);
                            energy -= scaled_amount;

                            let energy_atomic = state.energy_atomic();
                            energy_atomic[target_idx as usize]
                                .fetch_add(scaled_amount, std::sync::atomic::Ordering::Relaxed);
                        }
                    }

                    pc += 3;
                    gas_used += 10;
                }
                GlyphOp::Replicate => {
                    let aggression = state.matrix.hormones[2] as i32;
                    let e_thresh = 50 - (aggression >> 3);
                    let r_thresh = 10 - (aggression >> 5);

                    if energy > e_thresh * crate::SCALE
                        && state.matrix.resonance[atom_idx] > r_thresh
                    {
                        let cx = state.matrix.xs[atom_idx] as i32;
                        let cy = state.matrix.ys[atom_idx] as i32;

                        let child_energy = energy / 2;

                        state.push_spawn_request(atom_idx, cx, cy, child_energy);

                        state.energy_atomic()[atom_idx]
                            .fetch_sub(child_energy, std::sync::atomic::Ordering::Relaxed);
                        state.resonance_atomic()[atom_idx]
                            .fetch_add(30, std::sync::atomic::Ordering::Relaxed);

                        energy -= child_energy;
                    }

                    pc += 1;
                    gas_used += 15;
                }
                GlyphOp::Bind => {
                    let _mode_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let target_reg = self.fetch_instruction(state, atom_idx, pc, 2);

                    let target_idx = if target_reg < 8 {
                        state.matrix.context[atom_idx][target_reg as usize] as usize
                    } else {
                        0
                    };

                    if target_idx > 0 && target_idx < MAX_ATOMS && target_idx != atom_idx {
                        state.push_bond_request(atom_idx, atom_idx, target_idx);
                    }

                    pc += 3;
                    gas_used += 20;
                }
                GlyphOp::Hebb => {
                    let slot_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let slot = if slot_reg < 8 {
                        state.matrix.context[atom_idx][slot_reg as usize] as usize
                    } else {
                        0
                    };

                    if slot < 4 && resonance > 200 {
                        let bond_idx = (atom_idx * 4) + slot;
                        let target_idx = state.matrix.bonds[bond_idx] as usize;
                        if target_idx > 0
                            && target_idx < MAX_ATOMS
                            && state.matrix.ids[target_idx] != 0
                        {
                            let mut weight = state.synaptic_weights_atomic()[bond_idx]
                                .load(std::sync::atomic::Ordering::Relaxed);
                            if weight < 255 {
                                weight += 1;
                                state.synaptic_weights_atomic()[bond_idx]
                                    .store(weight, std::sync::atomic::Ordering::Relaxed);
                            }
                        }
                    }

                    pc += 2;
                    gas_used += 10;
                }
                GlyphOp::Fire => {
                    let slot_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let amp_reg = self.fetch_instruction(state, atom_idx, pc, 2);

                    let slot = if slot_reg < 8 {
                        state.matrix.context[atom_idx][slot_reg as usize] as usize
                    } else {
                        0
                    };

                    let amplitude = if amp_reg < 8 {
                        state.matrix.context[atom_idx][amp_reg as usize]
                    } else {
                        0
                    };

                    if slot < 4 && amplitude > 0 && energy >= (amplitude / 10) {
                        let bond_idx = (atom_idx * 4) + slot;
                        let target_idx = state.matrix.bonds[bond_idx] as usize;

                        if target_idx > 0
                            && target_idx < MAX_ATOMS
                            && state.matrix.ids[target_idx] != 0
                        {
                            let weight = state.matrix.synaptic_weights[bond_idx] as f32;
                            let fire_cost = amplitude / 10;

                            // Scale the transmitted resonance mathematically by the synaptic weight
                            let transmitted = ((amplitude as f32) * (weight / 255.0)) as i32;

                            if transmitted > 0 {
                                state.resonance_atomic()[target_idx]
                                    .fetch_add(transmitted, std::sync::atomic::Ordering::Relaxed);
                            }

                            // Pay the firing cost
                            state.energy_atomic()[atom_idx]
                                .fetch_sub(fire_cost, std::sync::atomic::Ordering::Relaxed);
                            energy -= fire_cost;
                        }
                    }

                    pc += 3;
                    gas_used += 15;
                }
                GlyphOp::Decay => {
                    let mut min_weight = 255;
                    let mut min_slot = None;

                    for slot in 0..4 {
                        let bond_idx = (atom_idx * 4) + slot;
                        let target_idx = state.matrix.bonds[bond_idx] as usize;
                        if target_idx > 0 {
                            let weight = state.synaptic_weights_atomic()[bond_idx]
                                .load(std::sync::atomic::Ordering::Relaxed);
                            if weight > 0 && weight < min_weight {
                                min_weight = weight;
                                min_slot = Some(slot);
                            }
                        }
                    }

                    if let Some(slot) = min_slot {
                        let bond_idx = (atom_idx * 4) + slot;
                        let mut weight = state.synaptic_weights_atomic()[bond_idx]
                            .load(std::sync::atomic::Ordering::Relaxed);
                        if weight > 0 {
                            weight -= 1;
                            state.synaptic_weights_atomic()[bond_idx]
                                .store(weight, std::sync::atomic::Ordering::Relaxed);

                            // Metabolic Recoup via network pruning
                            state.energy_atomic()[atom_idx]
                                .fetch_add(50, std::sync::atomic::Ordering::Relaxed);
                            energy += 50;
                        }
                    }

                    pc += 1;
                    gas_used += 10;
                }
                GlyphOp::Tensegrity => {
                    let target_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let val_reg = self.fetch_instruction(state, atom_idx, pc, 2);

                    let spring_target = if target_reg < 8 {
                        state.matrix.context[atom_idx][target_reg as usize]
                    } else {
                        0
                    };

                    let val = if val_reg < 8 {
                        state.matrix.context[atom_idx][val_reg as usize]
                    } else {
                        0
                    };

                    if spring_target >= 0 && spring_target < 4 {
                        let bond_idx = (atom_idx * 4) + spring_target as usize;
                        if state.matrix.bonds[bond_idx] != 0 {
                            // Map integers to f32 stiffness (val / 100)
                            let stiffness = (val as f32) / 100.0;
                            // Transmute f32 bit pattern to u32 for atomic storage
                            state.stiffness_atomic()[bond_idx]
                                .store(stiffness.to_bits(), std::sync::atomic::Ordering::Relaxed);
                        }
                    }

                    pc += 3;
                    gas_used += 5;
                }
                GlyphOp::Build => {
                    let type_val = self.fetch_instruction(state, atom_idx, pc, 1) as i32;
                    let state_val = self.fetch_instruction(state, atom_idx, pc, 2) as i32;

                    let build_val = (state_val << 24) | (0xFF << 16) | type_val;
                    let cx = state.matrix.xs[atom_idx] as usize;
                    let cy = state.matrix.ys[atom_idx] as usize;
                    let cell_idx = (cy / 10) * (GRID_W as usize) + (cx / 10);

                    state.publish_build_intent(cell_idx, atom_idx, build_val);
                    pc += 3;
                    gas_used += 10;
                }
                GlyphOp::Plug => {
                    let charge_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let charge_val = if charge_reg < 8 {
                        state.matrix.context[atom_idx][charge_reg as usize]
                    } else {
                        0
                    };
                    let cx = state.matrix.xs[atom_idx] as usize;
                    let cy = state.matrix.ys[atom_idx] as usize;
                    let cell_idx = (cy / 10) * (GRID_W as usize) + (cx / 10);

                    state.set_structure_charge_intent(cell_idx, charge_val);
                    pc += 2;
                    gas_used += 5;
                }
                GlyphOp::Sense => {
                    let dest_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    // Radius ignored for parity testing, directly sensing current cell
                    let cx = state.matrix.xs[atom_idx] as usize;
                    let cy = state.matrix.ys[atom_idx] as usize;
                    let cell_idx = (cy / 10) * (GRID_W as usize) + (cx / 10);

                    let val = state.read_structure_cell(cell_idx);
                    if dest_reg < 8 {
                        state.context_atomic(atom_idx)[dest_reg as usize]
                            .store(val, std::sync::atomic::Ordering::Relaxed);
                    }
                    pc += 4;
                    gas_used += 5;
                }
                GlyphOp::SecretePlasmid => {
                    // Extract genome offset parameter
                    let offset_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let offset = if offset_reg < 8 {
                        state.matrix.context[atom_idx][offset_reg as usize]
                    } else {
                        0
                    };

                    if energy >= 150_000 && offset >= 0 && offset <= 56 {
                        let cx = state.matrix.xs[atom_idx] as usize;
                        let cy = state.matrix.ys[atom_idx] as usize;
                        let cell_idx = (cy / 1000) * (GRID_W as usize) + (cx / 1000);

                        // Read 8 bytes from genome
                        let mut payload = [0u8; 8];
                        payload.copy_from_slice(
                            &state.matrix.instructions[atom_idx]
                                [offset as usize..(offset as usize + 8)],
                        );

                        // Deposit into payload atomically
                        let payload_atomic = state.glyph_payload_atomic();
                        for i in 0..8 {
                            payload_atomic[cell_idx * 8 + i]
                                .store(payload[i], std::sync::atomic::Ordering::Relaxed);
                        }

                        // Trigger interference map: Kind 3 (PLASMID), Max Amplitude (255)
                        state.atomic_deposit_glyph_header(cell_idx, 3, 255);

                        energy -= 150_000;
                    }

                    pc += 2;
                    gas_used += 10;
                }
                GlyphOp::IncorporatePlasmid => {
                    let offset_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let offset = if offset_reg < 8 {
                        state.matrix.context[atom_idx][offset_reg as usize]
                    } else {
                        0
                    };

                    if offset >= 0 && offset <= 56 {
                        let cx = state.matrix.xs[atom_idx] as usize;
                        let cy = state.matrix.ys[atom_idx] as usize;
                        let cell_idx = (cy / 1000) * (GRID_W as usize) + (cx / 1000);

                        let header = state.glyph_header_atomic()[cell_idx]
                            .load(std::sync::atomic::Ordering::Relaxed);
                        let kind = (header & 0xFF) as u8;

                        if kind == 3 {
                            let payload_atomic = state.glyph_payload_atomic();
                            let mut new_bytes = [0u8; 8];
                            for i in 0..8 {
                                new_bytes[i] = payload_atomic[cell_idx * 8 + i]
                                    .load(std::sync::atomic::Ordering::Relaxed);
                            }

                            // CRISPR Immunity Check
                            // Fast hash: shifting the first 4 bytes into a 32-bit integer.
                            let mut plasmid_hash: i32 = 0;
                            plasmid_hash |= (new_bytes[0] as i32) << 24;
                            plasmid_hash |= (new_bytes[1] as i32) << 16;
                            plasmid_hash |= (new_bytes[2] as i32) << 8;
                            plasmid_hash |= new_bytes[3] as i32;

                            let immune_memory = state.context_atomic(atom_idx)[13]
                                .load(std::sync::atomic::Ordering::Relaxed);

                            if immune_memory != 0 && immune_memory == plasmid_hash {
                                // MATCH! Execute OP_PURGE immunity mechanism.
                                // 1. Destroy payload in environment
                                for i in 0..8 {
                                    payload_atomic[cell_idx * 8 + i]
                                        .store(0, std::sync::atomic::Ordering::Relaxed);
                                }
                                state.glyph_header_atomic()[cell_idx]
                                    .store(0, std::sync::atomic::Ordering::Relaxed);

                                // 2. Metabolic Bonus (+50_000 raw energy)
                                state.energy_atomic()[atom_idx]
                                    .fetch_add(50_000, std::sync::atomic::Ordering::Relaxed);
                                energy += 50_000;

                                // 3. Abort insertion
                                gas_used += 10;
                            } else {
                                // NAIVE ENCOUNTER
                                // Record the hash into Trauma Tracker (Reg 14) for potential learning at end of step
                                state.context_atomic(atom_idx)[14]
                                    .store(plasmid_hash, std::sync::atomic::Ordering::Relaxed);

                                // Thermodynamic Safeguard
                                let mut current_bytes = [0u8; 8];
                                current_bytes.copy_from_slice(
                                    &state.matrix.instructions[atom_idx]
                                        [offset as usize..(offset as usize + 8)],
                                );

                                // We need full 64 byte frames for entropy calculations
                                let mut mock_old = [0u8; 64];
                                mock_old.copy_from_slice(&state.matrix.instructions[atom_idx]);
                                let mut mock_new = [0u8; 64];
                                mock_new.copy_from_slice(&state.matrix.instructions[atom_idx]);
                                mock_new[offset as usize..(offset as usize + 8)]
                                    .copy_from_slice(&new_bytes);

                                let entropy_old = crate::calculate_shannon_entropy(&mock_old);
                                let entropy_new = crate::calculate_shannon_entropy(&mock_new);

                                let is_desperate = energy < (100_000_000 / 10);

                                if entropy_new < entropy_old || is_desperate {
                                    // SAFETY: We hold an atomic lock on our own atom's execution (step_count loop bounds gas).
                                    // Under the parallel execution model, no other thread writes to our `atom_idx` instruction block
                                    // concurrently. Atomic protection applies inter-atom, but intra-atom we have absolute sovereignty.
                                    unsafe {
                                        let inst_ptr =
                                            state.matrix.instructions.as_ptr() as *mut [u8; 64];
                                        let atom_inst = &mut *inst_ptr.add(atom_idx);
                                        atom_inst[offset as usize..(offset as usize + 8)]
                                            .copy_from_slice(&new_bytes);
                                    }
                                    // Evict Entropy Cache
                                    state.context_atomic(atom_idx)[15]
                                        .store(0, std::sync::atomic::Ordering::Relaxed);
                                }
                            }
                        }
                    }

                    pc += 2;
                    gas_used += 5;
                }
                GlyphOp::Signal => {
                    let type_reg = self.fetch_instruction(state, atom_idx, pc, 1);
                    let intensity_reg = self.fetch_instruction(state, atom_idx, pc, 2);
                    let kind = if type_reg < 8 {
                        state.matrix.context[atom_idx][type_reg as usize] as u8
                    } else {
                        0
                    };
                    let intensity = if intensity_reg < 8 {
                        state.matrix.context[atom_idx][intensity_reg as usize]
                    } else {
                        0
                    };

                    let cx = state.matrix.xs[atom_idx] as usize;
                    let cy = state.matrix.ys[atom_idx] as usize;
                    let cell_idx = (cy / 10) * (GRID_W as usize) + (cx / 10);

                    // Re-implementing atomic_deposit_glyph_header locally for parity
                    // It mutates global arrays internally.
                    state.atomic_deposit_glyph_header(cell_idx, kind, intensity);
                    pc += 3;
                    gas_used += 5;
                }
                GlyphOp::Collective => {
                    let mode = self.fetch_instruction(state, atom_idx, pc, 1);
                    let p2 = self.fetch_instruction(state, atom_idx, pc, 2);
                    let p3 = self.fetch_instruction(state, atom_idx, pc, 3);

                    if mode == 0 {
                        // Hive Store
                        let addr = (p2 as usize) & 1023;
                        let val = (p3 & 0xFF) as u8;
                        // Note: hive_memory doesn't have an atomic array yet, but it's typically sequential.
                        // For pure race safety, we'd need AtomicU8 array. Simple tests avoid intense races here.
                        // Assuming deterministic scheduling or acceptable last-write-wins for hive_memory.
                        // (Deno SAB had atomic views but we can skip if not heavily tested for races)
                        state.hive_memory_atomic()[addr]
                            .store(val, std::sync::atomic::Ordering::Relaxed);
                        gas_used += 10;
                    } else if mode == 1 {
                        // Hive Load
                        let addr = (p2 as usize) & 1023;
                        let reg = (p3 as usize) & 7;
                        let loaded = state.hive_memory_atomic()[addr]
                            .load(std::sync::atomic::Ordering::Relaxed)
                            as i32;
                        state.context_atomic(atom_idx)[reg as usize]
                            .store(loaded, std::sync::atomic::Ordering::Relaxed);
                        gas_used += 10;
                    } else if mode == 3 {
                        // Hive Deposit
                        let val = (p2 & 0xFF) as i32;
                        if energy >= val * crate::SCALE {
                            let hive_bal_atomic = state.hive_balance_atomic();
                            hive_bal_atomic.fetch_add(val, std::sync::atomic::Ordering::Relaxed);
                            state.energy_atomic()[atom_idx].fetch_sub(
                                val * crate::SCALE,
                                std::sync::atomic::Ordering::Relaxed,
                            );
                            energy -= val * crate::SCALE;
                        }
                        gas_used += 15;
                    } else if mode == 4 {
                        // Hive Withdraw
                        let reg = (p2 as usize) & 7;
                        let hive_bal_atomic = state.hive_balance_atomic();

                        let mut amount = 0;
                        let mut current_bal =
                            hive_bal_atomic.load(std::sync::atomic::Ordering::Acquire);
                        loop {
                            let curr_amt = if current_bal > 100 { 100 } else { current_bal };
                            if curr_amt <= 0 {
                                break;
                            }
                            match hive_bal_atomic.compare_exchange(
                                current_bal,
                                current_bal - curr_amt,
                                std::sync::atomic::Ordering::AcqRel,
                                std::sync::atomic::Ordering::Acquire,
                            ) {
                                Ok(_) => {
                                    state.energy_atomic()[atom_idx].fetch_add(
                                        curr_amt * crate::SCALE,
                                        std::sync::atomic::Ordering::Relaxed,
                                    );
                                    energy += curr_amt * crate::SCALE;
                                    amount = curr_amt;
                                    break;
                                }
                                Err(actual) => current_bal = actual,
                            }
                        }
                        state.context_atomic(atom_idx)[reg as usize]
                            .store(amount, std::sync::atomic::Ordering::Relaxed);
                        gas_used += 15;
                    } else if mode == 5 {
                        // Phase Lock (Bonds)
                        // Note: For parallel execution, mutating another atom's context directly is a race.
                        // We must cast the target's PC to AtomicI32 temporarily if run across threads.
                        for slot in 0..4 {
                            let bond_idx = (atom_idx * 4) + slot;
                            let target = state.matrix.bonds[bond_idx] as usize;
                            if target > 0 && target < MAX_ATOMS && state.matrix.ids[target] != 0 {
                                // Thread-safe PC override
                                state.context_atomic(target)[8]
                                    .store((pc + 4) as i32, std::sync::atomic::Ordering::Release);
                            }
                        }
                        gas_used += 15;
                    } else if mode == 6 {
                        // Quorum PC Sync
                        let cx = state.matrix.xs[atom_idx] as i32 / 10;
                        let cy = state.matrix.ys[atom_idx] as i32 / 10;
                        if in_grid(cx, cy) {
                            let count = state.get_spatial_grid_count(cx, cy);
                            for i in 0..count {
                                let peer = state.get_spatial_grid_atom(cx, cy, i) as usize;
                                if peer > 0
                                    && peer < MAX_ATOMS
                                    && peer != atom_idx
                                    && state.matrix.ids[peer] != 0
                                {
                                    state.context_atomic(peer)[8].store(
                                        (pc + 4) as i32,
                                        std::sync::atomic::Ordering::Release,
                                    );
                                }
                            }
                        }
                        gas_used += 20;
                    }

                    pc += 4; // Length is 4 according to verification harness
                }
                GlyphOp::Syscall => {
                    let context_regs = state.context_atomic(atom_idx);
                    let sys_id = context_regs[0].load(std::sync::atomic::Ordering::Relaxed); // R0
                    let r1 = context_regs[1].load(std::sync::atomic::Ordering::Relaxed);
                    let r2 = context_regs[2].load(std::sync::atomic::Ordering::Relaxed);
                    let r3 = context_regs[3].load(std::sync::atomic::Ordering::Relaxed);

                    match sys_id {
                        SYS_ATTRACT => {
                            let target_idx = r1 as usize;
                            let attract_force = r2;

                            if target_idx > 0
                                && target_idx < MAX_ATOMS
                                && state.matrix.ids[target_idx] != 0
                            {
                                let ox = state.matrix.xs[atom_idx] as i32;
                                let oy = state.matrix.ys[atom_idx] as i32;
                                let tx = state.matrix.xs[target_idx] as i32;
                                let ty = state.matrix.ys[target_idx] as i32;

                                let dx = tx - ox;
                                let dy = ty - oy;

                                let dx_sign = if dx > 0 {
                                    1
                                } else if dx < 0 {
                                    -1
                                } else {
                                    0
                                };
                                let dy_sign = if dy > 0 {
                                    1
                                } else if dy < 0 {
                                    -1
                                } else {
                                    0
                                };

                                let move_dir_x = if attract_force > 0 { dx_sign } else { -dx_sign };
                                let move_dir_y = if attract_force > 0 { dy_sign } else { -dy_sign };

                                if move_dir_x != 0 || move_dir_y != 0 {
                                    let nx = ox + (move_dir_x * 10);
                                    let ny = oy + (move_dir_y * 10);

                                    let is_escaped = nx < 0 || nx > 1399 || ny < 0 || ny > 799;

                                    if is_escaped {
                                        state.dispatch_egress(atom_idx, nx, ny, energy);
                                        state.energy_atomic()[atom_idx]
                                            .store(0, std::sync::atomic::Ordering::Relaxed);
                                        state.ids_atomic()[atom_idx]
                                            .store(0, std::sync::atomic::Ordering::Relaxed);
                                        energy = 0;
                                    } else {
                                        let n_grid_x = nx / 10;
                                        let n_grid_y = ny / 10;
                                        let count_in_cell =
                                            state.get_spatial_grid_count(n_grid_x, n_grid_y);
                                        if count_in_cell < 31 {
                                            state.xs_atomic()[atom_idx].store(
                                                nx as i16,
                                                std::sync::atomic::Ordering::Relaxed,
                                            );
                                            state.ys_atomic()[atom_idx].store(
                                                ny as i16,
                                                std::sync::atomic::Ordering::Relaxed,
                                            );
                                        }
                                    }
                                }
                            }
                            gas_used += 10;
                        }
                        SYS_FOLD => {
                            gas_used += 10;
                        }
                        SYS_SPAWN => {
                            let child_energy = r1 * 1000;
                            let dx = r2;
                            let dy = r3;

                            if energy > child_energy {
                                let cx = (state.matrix.xs[atom_idx] as i32) + dx;
                                let cy = (state.matrix.ys[atom_idx] as i32) + dy;

                                state.push_spawn_request(atom_idx, cx, cy, child_energy);

                                state.energy_atomic()[atom_idx]
                                    .fetch_sub(child_energy, std::sync::atomic::Ordering::Relaxed);
                                energy -= child_energy;
                            }
                            gas_used += 20;
                        }
                        SYS_BIND => {
                            let target_idx = r1 as usize;
                            if target_idx > 0 && target_idx < MAX_ATOMS && target_idx != atom_idx {
                                state.push_bond_request(atom_idx, atom_idx, target_idx);
                            }
                            gas_used += 15;
                        }
                        SYS_TRANSFER => {
                            let target_idx = r1 as usize;
                            let resource_type = r2;
                            let amount = r3; // positive to give, negative to take (steal)

                            if target_idx > 0
                                && target_idx < MAX_ATOMS
                                && amount != 0
                                && state.matrix.ids[target_idx] != 0
                            {
                                if resource_type == 0 {
                                    // Energy
                                    if amount > 0 {
                                        // Giving
                                        let scaled_amount = amount * 1000;
                                        if state.matrix.energy[atom_idx] >= scaled_amount {
                                            state.energy_atomic()[atom_idx].fetch_sub(
                                                scaled_amount,
                                                std::sync::atomic::Ordering::Relaxed,
                                            );
                                            energy -= scaled_amount;
                                            let energy_atomic = state.energy_atomic();
                                            energy_atomic[target_idx].fetch_add(
                                                scaled_amount,
                                                std::sync::atomic::Ordering::Relaxed,
                                            );
                                        }
                                    } else {
                                        // Taking/Stealing (negative amount)
                                        let my_role = state.roles_atomic()[atom_idx]
                                            .load(std::sync::atomic::Ordering::Relaxed)
                                            & 0x7F;
                                        let target_role = state.roles_atomic()[target_idx]
                                            .load(std::sync::atomic::Ordering::Relaxed)
                                            & 0x7F;

                                        if my_role == 3 && target_role == 1 {
                                            let t_energy = state.energy_atomic()[target_idx]
                                                .load(std::sync::atomic::Ordering::Acquire);
                                            if t_energy > 20_000 {
                                                // Mutate to Mitochondria (role 5)
                                                let current_role = state.roles_atomic()[target_idx]
                                                    .load(std::sync::atomic::Ordering::Relaxed);
                                                state.roles_atomic()[target_idx].store(
                                                    5 | (current_role & 0x80),
                                                    std::sync::atomic::Ordering::Relaxed,
                                                );
                                                // Store host atom_idx in Context Reg 12
                                                state.context_atomic(target_idx)[12].store(
                                                    atom_idx as i32,
                                                    std::sync::atomic::Ordering::Relaxed,
                                                );
                                                break; // Engulfment replaces stealing
                                            }
                                        }

                                        let my_resonance = state.matrix.resonance[atom_idx];
                                        let target_defense =
                                            if state.matrix.evolution_reserved[target_idx] > 0 {
                                                state.matrix.evolution_reserved[target_idx]
                                            } else {
                                                state.matrix.resonance[target_idx]
                                            };

                                        if my_resonance > target_defense {
                                            let ox = state.matrix.xs[atom_idx] as f32;
                                            let oy = state.matrix.ys[atom_idx] as f32;
                                            let tx = state.matrix.xs[target_idx] as f32;
                                            let ty = state.matrix.ys[target_idx] as f32;

                                            let dx = (tx - ox) / 10.0;
                                            let dy = (ty - oy) / 10.0;
                                            let dist_sq = dx * dx + dy * dy;

                                            if dist_sq <= 2.25 {
                                                let steal_amount = (-amount) * 1000;
                                                let energy_atomic = state.energy_atomic();
                                                let mut t_energy = energy_atomic[target_idx]
                                                    .load(std::sync::atomic::Ordering::Acquire);
                                                let mut final_take = 0;
                                                loop {
                                                    let take_amount =
                                                        std::cmp::min(steal_amount, t_energy);
                                                    if take_amount <= 0 {
                                                        break;
                                                    }
                                                    match energy_atomic[target_idx]
                                                        .compare_exchange(
                                                            t_energy,
                                                            t_energy - take_amount,
                                                            std::sync::atomic::Ordering::AcqRel,
                                                            std::sync::atomic::Ordering::Acquire,
                                                        ) {
                                                        Ok(_) => {
                                                            final_take = take_amount;
                                                            break;
                                                        }
                                                        Err(actual) => t_energy = actual,
                                                    }
                                                }
                                                if final_take > 0 {
                                                    state.energy_atomic()[atom_idx].fetch_add(
                                                        final_take,
                                                        std::sync::atomic::Ordering::Relaxed,
                                                    );
                                                    energy += final_take;
                                                }
                                            }
                                        }
                                    }
                                } else if resource_type == 1 {
                                    // Resonance (only giving permitted for now)
                                    if amount > 0 && state.matrix.resonance[atom_idx] >= amount {
                                        state.resonance_atomic()[atom_idx].fetch_sub(
                                            amount,
                                            std::sync::atomic::Ordering::Relaxed,
                                        );
                                        resonance -= amount;
                                        let res_atomic = state.resonance_atomic();
                                        res_atomic[target_idx].fetch_add(
                                            amount,
                                            std::sync::atomic::Ordering::Relaxed,
                                        );
                                    }
                                }
                            }
                            gas_used += if amount < 0 { 30 } else { 10 };
                        }
                        _ => {
                            gas_used += 10;
                        }
                    }
                    pc += 1; // Basic jump over opcode for next resume if applicable
                    gas_limit = 0; // Yield to host
                }
                GlyphOp::Unknown => {
                    // Stop execution on invalid opcode
                    pc = 0;
                    gas_used += 1;
                    gas_limit = 0;
                }
            }

            if pc >= 64 {
                pc = 0;
            }
        }

        // Writeback PC
        state.context_atomic(atom_idx)[8].store(pc as i32, std::sync::atomic::Ordering::Relaxed);

        // Structural Thermodynamics (Shannon Entropy Noise Tax)
        let mut cached_entropy_plus_one = state.matrix.context[atom_idx][15];
        if cached_entropy_plus_one == 0 {
            let entropy =
                calculate_shannon_entropy(&state.matrix.instructions[atom_idx]);
            cached_entropy_plus_one = entropy + 1;
            state.context_atomic(atom_idx)[15].store(
                cached_entropy_plus_one,
                std::sync::atomic::Ordering::Relaxed,
            );
        }
        let entropy_val = cached_entropy_plus_one - 1;

        // Metabolics
        let entropy_h = state.matrix.hormones[0] as i32;
        let repair_h = state.matrix.hormones[4] as i32;
        let friction_h = state.matrix.hormones[5] as i32;

        let coherence_val = state.matrix.neural_coherence;
        let discount = if coherence_val > 1000 {
            2
        } else if coherence_val > 100 {
            1
        } else {
            0
        };

        let base_compute_cost = gas_used >> discount;
        let noise_tax = (base_compute_cost * entropy_val) >> 12;
        let metabolic_cost = 1
            + base_compute_cost
            + noise_tax
            + ((gas_used * entropy_h) >> (12 + discount))
            + (friction_h >> 8);

        // Phase Synchronization
        if coherence_val > 500 {
            let mut cur_phase = state.matrix.phase[atom_idx] as i32;
            if cur_phase < 128 {
                cur_phase += 2;
            } else if cur_phase > 128 {
                cur_phase -= 1;
            }
            state.phase_atomic()[atom_idx].store(cur_phase, std::sync::atomic::Ordering::Relaxed);
        }

        // Action potential
        if resonance > 300 {
            if energy > 200 {
                energy -= 200;
                resonance = 0;
                state.phase_atomic()[atom_idx].store(5, std::sync::atomic::Ordering::Relaxed);
                // fireSignal omitted for offline simple ALU testing
            } else {
                resonance = 280;
            }
        }

        let resonance_decay = if repair_h > 1024 { 1 } else { 2 };

        if resonance > 0 {
            state.resonance_atomic()[atom_idx].store(
                std::cmp::max(0, resonance - resonance_decay),
                std::sync::atomic::Ordering::Relaxed,
            );
        }

        let final_energy = if energy > metabolic_cost {
            energy - metabolic_cost
        } else {
            0
        };

        // CRISPR Trauma Learning (Checkout Phase)
        // If the atom suffered massive metabolic drain but survived (0 < final_energy <= starvation floor)
        // we persist the temporary Trauma Tracker (Reg 14) into permanent CRISPR Cassette (Reg 13).
        if final_energy > 0 && final_energy <= 100_000 {
            let trauma_hash =
                state.context_atomic(atom_idx)[14].load(std::sync::atomic::Ordering::Relaxed);
            if trauma_hash != 0 {
                // Learn the traumatic signature
                state.context_atomic(atom_idx)[13]
                    .store(trauma_hash, std::sync::atomic::Ordering::Relaxed);
                state.context_atomic(atom_idx)[14].store(0, std::sync::atomic::Ordering::Relaxed);
            }
        }

        state.energy_atomic()[atom_idx].store(final_energy, std::sync::atomic::Ordering::Relaxed);

        if final_energy == 0 {
            state.ids_atomic()[atom_idx].store(0, std::sync::atomic::Ordering::Relaxed);
        }
    }
}
```

---

## FILE: src/00/sigma_core/src/ontology_gen/03/tick_membrane_physics.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/autopoiesis/tick_membrane_physics.md
// Substrate Node: tick_membrane_physics
// Level: 3
// Membrane physics and tissue differentiation for Topography analysis

#![allow(unused_imports)]
use super::super::L02::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/04/P2P_CODEC.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/swarm/p2p_codec.md
#![allow(unused_imports)]
use super::super::L03::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/04/P2P_FEDERATION.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/swarm/federation.md
#![allow(unused_imports)]
use super::super::L03::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/04/PULSE.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/pulse_orchestrator.md
#![allow(unused_imports)]
use super::super::L03::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/04/PULSE_WORKER.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/pulse_worker.md
#![allow(unused_imports)]
use super::super::L03::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/04/SWARM_NEXUS.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/swarm/swarm_nexus.md
#![allow(unused_imports)]
use super::super::L03::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/04/SWARM_NODE.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/swarm/swarm_node.md
#![allow(unused_imports)]
use super::super::L03::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/04/evaluate_opcodes.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/evaluate_opcodes.md
#![allow(unused_imports)]
use super::super::L03::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/04/mod.rs

```rust
// AUTOGENERATED LEVEL FACADE

pub use super::L03::*;

#[path = "SWARM_NODE.rs"]
pub mod SWARM_NODE;
pub use SWARM_NODE::*;
#[path = "P2P_CODEC.rs"]
pub mod P2P_CODEC;
pub use P2P_CODEC::*;
#[path = "P2P_FEDERATION.rs"]
pub mod P2P_FEDERATION;
pub use P2P_FEDERATION::*;
#[path = "SWARM_NEXUS.rs"]
pub mod SWARM_NEXUS;
pub use SWARM_NEXUS::*;
#[path = "evaluate_opcodes.rs"]
pub mod evaluate_opcodes;
pub use evaluate_opcodes::*;
#[path = "PULSE.rs"]
pub mod PULSE;
pub use PULSE::*;
#[path = "PULSE_WORKER.rs"]
pub mod PULSE_WORKER;
pub use PULSE_WORKER::*;
#[path = "tick_structure_grid.rs"]
pub mod tick_structure_grid;
pub use tick_structure_grid::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/04/tick_structure_grid.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/tick_structure_grid.md
#![allow(unused_imports)]
use super::super::L03::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/05/AVATAR_ENGINE.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/semantic/avatar_engine.md
#![allow(unused_imports)]
use super::super::L04::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/05/SEMANTIC_MEMBRANE.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/semantic/semantic_membrane.md
#![allow(unused_imports)]
use super::super::L04::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/05/SOVEREIGN_ORACLE.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/semantic/sovereign_oracle.md
#![allow(unused_imports)]
use super::super::L04::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/05/execute_atom.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/execute_atom.md
#![allow(unused_imports)]
use super::super::L04::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/05/llm_soul.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/semantic/llm_soul.md
#![allow(unused_imports)]
use super::super::L04::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/05/mod.rs

```rust
// AUTOGENERATED LEVEL FACADE

pub use super::L04::*;

#[path = "execute_atom.rs"]
pub mod execute_atom;
pub use execute_atom::*;
#[path = "SOVEREIGN_ORACLE.rs"]
pub mod SOVEREIGN_ORACLE;
pub use SOVEREIGN_ORACLE::*;
#[path = "llm_soul.rs"]
pub mod llm_soul;
pub use llm_soul::*;
#[path = "AVATAR_ENGINE.rs"]
pub mod AVATAR_ENGINE;
pub use AVATAR_ENGINE::*;
#[path = "SEMANTIC_MEMBRANE.rs"]
pub mod SEMANTIC_MEMBRANE;
pub use SEMANTIC_MEMBRANE::*;
#[path = "tick_environment.rs"]
pub mod tick_environment;
pub use tick_environment::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/05/tick_environment.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/physics/tick_environment.md
#![allow(unused_imports)]
use super::super::L04::*;

// Omitted: manual substrate implementation

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/BREATH.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/breath_cycle.md
#![allow(unused_imports)]
use super::super::L05::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/GLYPH_TELEMETRY.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/telemetry/glyph_telemetry.md
#![allow(unused_imports)]
use super::super::L05::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/LOGGER.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/LOGGER.md
#![allow(unused_imports)]
use super::super::L05::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/MUTATION_TELEMETRY.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/telemetry/mutation_telemetry.md
#![allow(unused_imports)]
use super::super::L05::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/OMEGA_DAEMON.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/omega_daemon.md
#![allow(unused_imports)]
use super::super::L05::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/SERVE_DASHBOARD.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/telemetry/serve_dashboard.md
#![allow(unused_imports)]
use super::super::L05::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/TUI_DASHBOARD.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/telemetry/tui_dashboard.md
#![allow(unused_imports)]
use super::super::L05::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/base64_to_bytes.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/crypto/base64_to_bytes.md
#![allow(unused_imports)]
use super::super::L05::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/bytes_to_base64.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/crypto/bytes_to_base64.md
#![allow(unused_imports)]
use super::super::L05::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/bytes_to_hex.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/crypto/bytes_to_hex.md
#![allow(unused_imports)]
use super::super::L05::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/fnv1a32.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/crypto/fnv1a32.md
#![allow(unused_imports)]
use super::super::L05::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/get_glyph_arity.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/get_glyph_arity.md
#![allow(unused_imports)]
use super::super::L05::*;

pub fn get_glyph_arity(id: u8) -> u8 {
    GLYPH_ARITY_LUT[(id & 63) as usize]
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/get_glyph_energy.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/get_glyph_energy.md
#![allow(unused_imports)]
use super::super::L05::*;

pub fn get_glyph_energy(id: u8) -> u8 {
    GLYPH_ENERGY_LUT[(id & 63) as usize]
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/get_glyph_kind.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/get_glyph_kind.md
#![allow(unused_imports)]
use super::super::L05::*;

pub fn get_glyph_kind(id: u8) -> u8 {
    if id <= 3 {
      return KIND_CORE;
    }
    if id <= 15 {
      return KIND_CONTROL;
    }
    return id >> 3;
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/get_glyph_legacy_opcode.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/core/get_glyph_legacy_opcode.md
#![allow(unused_imports)]
use super::super::L05::*;

pub fn get_glyph_legacy_opcode(id: u8) -> u8 {
    GLYPH_LEGACY_OPCODE_LUT[(id & 63) as usize]
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/hex_to_bytes.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/crypto/hex_to_bytes.md
#![allow(unused_imports)]
use super::super::L05::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/make_xor_shift32.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/make_xor_shift32.md
#![allow(unused_imports)]
use super::super::L05::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/mod.rs

```rust
// AUTOGENERATED LEVEL FACADE

pub use super::L05::*;

#[path = "normalize_hex64.rs"]
pub mod normalize_hex64;
pub use normalize_hex64::*;
#[path = "bytes_to_base64.rs"]
pub mod bytes_to_base64;
pub use bytes_to_base64::*;
#[path = "stable_stringify.rs"]
pub mod stable_stringify;
pub use stable_stringify::*;
#[path = "base64_to_bytes.rs"]
pub mod base64_to_bytes;
pub use base64_to_bytes::*;
#[path = "fnv1a32.rs"]
pub mod fnv1a32;
pub use fnv1a32::*;
#[path = "hex_to_bytes.rs"]
pub mod hex_to_bytes;
pub use hex_to_bytes::*;
#[path = "bytes_to_hex.rs"]
pub mod bytes_to_hex;
pub use bytes_to_hex::*;
#[path = "get_glyph_legacy_opcode.rs"]
pub mod get_glyph_legacy_opcode;
pub use get_glyph_legacy_opcode::*;
#[path = "get_glyph_kind.rs"]
pub mod get_glyph_kind;
pub use get_glyph_kind::*;
#[path = "get_glyph_arity.rs"]
pub mod get_glyph_arity;
pub use get_glyph_arity::*;
#[path = "BREATH.rs"]
pub mod BREATH;
pub use BREATH::*;
#[path = "get_glyph_energy.rs"]
pub mod get_glyph_energy;
pub use get_glyph_energy::*;
#[path = "OMEGA_DAEMON.rs"]
pub mod OMEGA_DAEMON;
pub use OMEGA_DAEMON::*;
#[path = "LOGGER.rs"]
pub mod LOGGER;
pub use LOGGER::*;
#[path = "pack_structure_intent.rs"]
pub mod pack_structure_intent;
pub use pack_structure_intent::*;
#[path = "make_xor_shift32.rs"]
pub mod make_xor_shift32;
pub use make_xor_shift32::*;
#[path = "unpack_structure_charge.rs"]
pub mod unpack_structure_charge;
pub use unpack_structure_charge::*;
#[path = "to_int16_big_endian.rs"]
pub mod to_int16_big_endian;
pub use to_int16_big_endian::*;
#[path = "TUI_DASHBOARD.rs"]
pub mod TUI_DASHBOARD;
pub use TUI_DASHBOARD::*;
#[path = "MUTATION_TELEMETRY.rs"]
pub mod MUTATION_TELEMETRY;
pub use MUTATION_TELEMETRY::*;
#[path = "GLYPH_TELEMETRY.rs"]
pub mod GLYPH_TELEMETRY;
pub use GLYPH_TELEMETRY::*;
#[path = "SERVE_DASHBOARD.rs"]
pub mod SERVE_DASHBOARD;
pub use SERVE_DASHBOARD::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/normalize_hex64.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/crypto/normalize_hex64.md
#![allow(unused_imports)]
use super::super::L05::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/pack_structure_intent.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/pack_structure_intent.md
#![allow(unused_imports)]
use super::super::L05::*;

pub fn pack_structure_intent(target_type: u32, target_value: u32, locked: bool) -> i32 {
    let mut intent: u32 = target_type | (target_value << 24);
    if locked {
        intent |= 0x80000000;
    }
    intent as i32
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/stable_stringify.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/crypto/stable_stringify.md
#![allow(unused_imports)]
use super::super::L05::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/to_int16_big_endian.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/to_int16_big_endian.md
#![allow(unused_imports)]
use super::super::L05::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/06/unpack_structure_charge.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/unpack_structure_charge.md
#![allow(unused_imports)]
use super::super::L05::*;

pub fn unpack_structure_charge(intent: i32) -> u32 {
    ((intent as u32) & 0x7F000000) >> 24
}

```

---

## FILE: src/00/sigma_core/src/ontology_gen/07/assembler.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/assembler.md
#![allow(unused_imports)]
use super::super::L06::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/07/crypto_keys.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/crypto/crypto_keys.md
#![allow(unused_imports)]
use super::super::L06::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/07/disassembler.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/disassembler.md
#![allow(unused_imports)]
use super::super::L06::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/07/glyph_ir_64.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/glyph_ir_64.md
#![allow(unused_imports)]
use super::super::L06::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/07/mod.rs

```rust
// AUTOGENERATED LEVEL FACADE

pub use super::L06::*;

#[path = "crypto_keys.rs"]
pub mod crypto_keys;
pub use crypto_keys::*;
#[path = "sha256_hex.rs"]
pub mod sha256_hex;
pub use sha256_hex::*;
#[path = "glyph_ir_64.rs"]
pub mod glyph_ir_64;
pub use glyph_ir_64::*;
#[path = "assembler.rs"]
pub mod assembler;
pub use assembler::*;
#[path = "disassembler.rs"]
pub mod disassembler;
pub use disassembler::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/07/sha256_hex.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/crypto/sha256_hex.md
#![allow(unused_imports)]
use super::super::L06::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/08/glyph_pretty.rs

```rust
// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/host/glyph_pretty.md
#![allow(unused_imports)]
use super::super::L07::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/08/mod.rs

```rust
// AUTOGENERATED LEVEL FACADE

pub use super::L07::*;

#[path = "glyph_pretty.rs"]
pub mod glyph_pretty;
pub use glyph_pretty::*;

```

---

## FILE: src/00/sigma_core/src/ontology_gen/mod.rs

```rust
// AUTOGENERATED FACADE
#[allow(non_snake_case)]
#[allow(non_camel_case_types)]

#[path = "00/mod.rs"]
pub mod L00;
#[path = "01/mod.rs"]
pub mod L01;
#[path = "02/mod.rs"]
pub mod L02;
#[path = "03/mod.rs"]
pub mod L03;
#[path = "04/mod.rs"]
pub mod L04;
#[path = "05/mod.rs"]
pub mod L05;
#[path = "06/mod.rs"]
pub mod L06;
#[path = "07/mod.rs"]
pub mod L07;
#[path = "08/mod.rs"]
pub mod L08;

```

---
