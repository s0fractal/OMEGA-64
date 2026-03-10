use sigma_core::isa::{GlyphOp, SYS_EAT};
use sigma_core::memory::SigmaState;
use sigma_core::shadow::run_shadow_simulation;

#[test]
fn test_shadow_catastrophe_rejection() {
    let mut state = SigmaState::new();

    // Seed an atom (Victim)
    state.matrix.ids[1] = 1001;
    state.matrix.energy[1] = 5000;

    // Seed an atom (Attacker)
    state.matrix.ids[2] = 2002;
    state.matrix.energy[2] = 1000;
    state.matrix.xs[2] = 1; // Adjacent
    state.matrix.ys[2] = 0;

    // Create base state
    let initial_population = state.matrix.ids.iter().filter(|&&id| id != 0).count() as i32;

    // We hallucinate a destructive "EAT" script replacing Attacker's behavior
    // OP_SET R1, 1 (Target = 1)
    // OP_SET R2, 5000 (Amount)
    // OP_SET R0, SYS_EAT
    // OP_SYSCALL
    let mut destruct_genome = [0u8; 64];
    destruct_genome[0] = GlyphOp::Set as u8;
    destruct_genome[1] = 1; // R1
    destruct_genome[2] = 1; // Target idx = 1
    destruct_genome[3] = GlyphOp::Set as u8;
    destruct_genome[4] = 2; // R2
                            // Encode 5000 (0x1388) across 4 bytes (simplified for literal here, let's just eat 255 for test)
    destruct_genome[5] = 255;
    destruct_genome[6] = GlyphOp::Set as u8;
    destruct_genome[7] = 0; // R0
    destruct_genome[8] = SYS_EAT as u8;
    destruct_genome[9] = GlyphOp::Syscall as u8;

    let metrics = run_shadow_simulation(&state, 2002, &destruct_genome, 10);

    // In this simulation, the attacker ate 255 energy from the victim, eventually dropping victim to 0.
    // We expect the matrix energy total to either be preserved or redistributed, but we can verify changes.
    // The population diff should definitely be -1 because the victim died.

    // Print the metrics for debugging
    println!("Shadow Metrics: {:?}", metrics);

    // Assert that the simulation successfully tracked the divergence
    assert_eq!(metrics.population_diff, -1);
    // As long as divergence_tick > 0, we caught the event during the simulation loop.
    assert!(metrics.divergence_tick > 0);
}
