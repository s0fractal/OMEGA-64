#[cfg(test)]
mod tests {
    use super::*;
    use std::mem::offset_of;

    #[test]
    fn verify_memory_offsets() {
        assert_eq!(offset_of!(SigmaMatrix, ids), 8_000_000, "ids");
        assert_eq!(offset_of!(SigmaMatrix, xs), 8_800_000, "xs");
        assert_eq!(offset_of!(SigmaMatrix, ys), 9_000_000, "ys");
        assert_eq!(offset_of!(SigmaMatrix, energy), 9_200_000, "energy");
        assert_eq!(offset_of!(SigmaMatrix, resonance), 9_600_000, "resonance");
        assert_eq!(offset_of!(SigmaMatrix, phase), 10_000_000, "phase");
        assert_eq!(offset_of!(SigmaMatrix, logic), 10_400_000, "logic");
        assert_eq!(offset_of!(SigmaMatrix, bonds), 11_200_000, "bonds");
        assert_eq!(offset_of!(SigmaMatrix, stiffness), 12_800_000, "stiffness");
        assert_eq!(offset_of!(SigmaMatrix, instructions), 14_400_000, "instructions");
        assert_eq!(offset_of!(SigmaMatrix, context), 20_800_000, "context");
        assert_eq!(offset_of!(SigmaMatrix, evolution_reserved), 27_200_000, "evolution");
        assert_eq!(offset_of!(SigmaMatrix, spawn_requests), 27_600_000, "spawn_requests");
        assert_eq!(offset_of!(SigmaMatrix, meiosis), 28_800_000, "meiosis");
        assert_eq!(offset_of!(SigmaMatrix, bond_requests), 30_000_000, "bond_requests");
        assert_eq!(offset_of!(SigmaMatrix, spatial_grid), 31_200_000, "spatial_grid");
        
        assert_eq!(offset_of!(SigmaMatrix, roles), 41_200_000, "roles");
        assert_eq!(offset_of!(SigmaMatrix, structure_grid), 42_200_000, "structure_grid");
        assert_eq!(offset_of!(SigmaMatrix, signal_grid), 43_200_000, "signal_grid");
        assert_eq!(offset_of!(SigmaMatrix, memory_grid), 44_200_000, "memory_grid");
        assert_eq!(offset_of!(SigmaMatrix, ascension_stats), 45_200_000, "ascension_stats");
        assert_eq!(offset_of!(SigmaMatrix, bond_distances), 46_200_000, "bond_distances");
        assert_eq!(offset_of!(SigmaMatrix, damping), 47_200_000, "damping");
        assert_eq!(offset_of!(SigmaMatrix, causality), 47_300_000, "causality");
        assert_eq!(offset_of!(SigmaMatrix, hive_memory), 48_200_000, "hive_memory");
        assert_eq!(offset_of!(SigmaMatrix, hive_balance), 48_201_024, "hive_balance");
        assert_eq!(offset_of!(SigmaMatrix, quorum), 48_300_000, "quorum");
        assert_eq!(offset_of!(SigmaMatrix, coherence), 48_700_100, "coherence");
        assert_eq!(offset_of!(SigmaMatrix, neural_coherence), 48_700_104, "neural_coherence");

        assert_eq!(offset_of!(SigmaMatrix, physics_read_xs), 48_800_000, "physics_read_xs");
        assert_eq!(offset_of!(SigmaMatrix, physics_read_ys), 49_000_000, "physics_read_ys");
        assert_eq!(offset_of!(SigmaMatrix, physics_read_energy), 49_200_000, "physics_read_energy");
        assert_eq!(offset_of!(SigmaMatrix, physics_read_resonance), 49_600_000, "physics_read_resonance");

        assert_eq!(offset_of!(SigmaMatrix, energy_delta), 50_000_000, "energy_delta");
        assert_eq!(offset_of!(SigmaMatrix, resonance_delta), 50_400_000, "resonance_delta");

        assert_eq!(offset_of!(SigmaMatrix, structure_build_owner), 50_800_000, "structure_build_owner");
        assert_eq!(offset_of!(SigmaMatrix, structure_build_value), 50_844_800, "structure_build_value");
        assert_eq!(offset_of!(SigmaMatrix, structure_charge_intent), 50_889_600, "structure_charge_intent");
        assert_eq!(offset_of!(SigmaMatrix, attention_field), 50_934_400, "attention_field");
        assert_eq!(offset_of!(SigmaMatrix, hive_energy_pool), 50_979_200, "hive_energy_pool");

        assert_eq!(offset_of!(SigmaMatrix, glyph_header), 50_980_224, "glyph_header");
        assert_eq!(offset_of!(SigmaMatrix, glyph_payload), 51_025_024, "glyph_payload");
        assert_eq!(offset_of!(SigmaMatrix, glyph_scratch_header), 51_114_624, "glyph_scratch_header");
        assert_eq!(offset_of!(SigmaMatrix, glyph_scratch_payload), 51_159_424, "glyph_scratch_payload");
        assert_eq!(offset_of!(SigmaMatrix, hormones), 51_249_024, "hormones");
        assert_eq!(offset_of!(SigmaMatrix, secretion_stats), 51_249_040, "secretion_stats");
        assert_eq!(offset_of!(SigmaMatrix, lineage), 51_400_000, "lineage");
        assert_eq!(offset_of!(SigmaMatrix, mailbox), 52_200_000, "mailbox");
        assert_eq!(offset_of!(SigmaMatrix, ledger_head), 53_000_000, "ledger_head");
        assert_eq!(offset_of!(SigmaMatrix, ledger_data), 53_000_004, "ledger_data");
    }
}
