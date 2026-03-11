use crate::memory::{SigmaMatrix, SigmaState};
use crate::pulse::PulseOrchestrator;

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
    let mut shadow_matrix = &mut shadow_state.matrix;

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
    let mut orchestrator = PulseOrchestrator::new();

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
        structural_value_change: final_structural_value.saturating_sub(initial_structural_value),
        population_diff: final_population.saturating_sub(initial_population),
        coherence_diff: final_coherence.saturating_sub(initial_coherence),
        divergence_tick: start_tick + ticks,
    }
}
