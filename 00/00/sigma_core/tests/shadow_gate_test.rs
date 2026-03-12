use sigma_core::isa::GlyphOp;
use sigma_core::memory::SigmaState;
use sigma_core::shadow::run_shadow_simulation;

#[test]
fn test_shadow_catastrophe_rejection() {
    let mut state = SigmaState::new();

    // Seed an atom (Victim)
    state.matrix.ids[1] = 1001;
    state.matrix.energy[1] = 100;

    // Seed an atom (Attacker)
    state.matrix.ids[2] = 2002;
    state.matrix.energy[2] = 1000;
    state.matrix.xs[2] = 1; // Adjacent
    state.matrix.ys[2] = 0;

    // Create base state
    // initial_population tracked mentally but unused directly

    // We hallucinate a destructive "TRANSFER" script replacing Attacker's behavior
    // OP_SET R1, 1 (Target = 1)
    // OP_SET R2, 0 (Resource = Energy)
    // OP_SET R4, 0
    // OP_SET R3, 255
    // OP_SUB R3, R4 (R3 = R4 - R3  =>  0 - 255 = -255)
    // OP_SET R0, SYS_TRANSFER
    // OP_SYSCALL
    let mut destruct_genome = [0u8; 64];
    destruct_genome[0] = GlyphOp::Set as u8;
    destruct_genome[1] = 1; // R1
    destruct_genome[2] = 1; // Target idx = 1

    destruct_genome[3] = GlyphOp::Set as u8;
    destruct_genome[4] = 2; // R2
    destruct_genome[5] = 0; // Resource = Energy

    destruct_genome[6] = GlyphOp::Set as u8;
    destruct_genome[7] = 4; // R4
    destruct_genome[8] = 0; // Value = 0

    destruct_genome[9] = GlyphOp::Set as u8;
    destruct_genome[10] = 3; // R3
    destruct_genome[11] = 255; // Amount = 255

    destruct_genome[12] = GlyphOp::Sub as u8;
    destruct_genome[13] = 3; // Dest: R3
    destruct_genome[14] = 4; // Src2: R4  => R3 = R3 - R4 !! Wait!

    // OP_SUB R3, R4 = R3 - R4 => 255 - 0 = 255
    // TO get -255 we need R3 = R4 - R3. So OP_SUB 3, 4, 3? Actually OP_SUB takes just two parameters. R1 = R1 - R2.
    // So OP_SUB 4, 3 => R4 = R4 - R3  (0 - 255 = -255).
    // Let's use R4 for the amount instead? Wait, TRANSFER uses R3 for amount.
    // So if R3 must hold -255, we can do OP_SUB 3, 4 only if R3 was 0 and R4 was 255.
    // Let's swap! R3 = 0, R4 = 255, OP_SUB 3, 4 => R3 = R3 - R4 (0 - 255 = -255). Yes!
    destruct_genome[10] = 3; // R3
    destruct_genome[11] = 0; // 0

    destruct_genome[12] = GlyphOp::Set as u8;
    destruct_genome[13] = 4; // R4
    destruct_genome[14] = 255; // 255

    destruct_genome[15] = GlyphOp::Sub as u8;
    destruct_genome[16] = 3; // R3
    destruct_genome[17] = 4; // R3 = R3 - R4 => -255

    destruct_genome[18] = GlyphOp::Set as u8;
    destruct_genome[19] = 0; // R0
    destruct_genome[20] = sigma_core::isa::SYS_TRANSFER as u8;
    destruct_genome[21] = GlyphOp::Syscall as u8;

    // Attacker needs high resonance to bypass target's shield!
    state.matrix.resonance[2] = 500;

    let metrics = run_shadow_simulation(&state, 2002, &destruct_genome, 10, 0);

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
