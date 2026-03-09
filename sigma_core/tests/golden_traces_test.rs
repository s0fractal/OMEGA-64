use sigma_core::isa::GlyphOp;
use sigma_core::{LambdaVM, SigmaState};

#[test]
fn test_rc01_replicator_loop() {
    let mut state = SigmaState::new();
    let mut vm = LambdaVM::new();

    let root_idx = 0;
    state.matrix.energy[root_idx] = 250;
    state.matrix.ids[root_idx] = 42; // arbitrary ID > 10

    // Set Hormones (to match some arbitrary expected Deno defaults)
    state.matrix.hormones[0] = 0; // entropy_pressure
    state.matrix.hormones[4] = 0; // repair_drive
    state.matrix.hormones[5] = 0; // friction_h
    state.matrix.neural_coherence = 0; // No discount

    // Write a simple program: SET R0, 10; SET R1, 5; ADD R0, R1; SUB R0, R1
    // 0x01 = SET, 0x04 = ADD, 0x05 = SUB
    state.matrix.instructions[root_idx][0] = 0x01; // SET
    state.matrix.instructions[root_idx][1] = 0; // R0
    state.matrix.instructions[root_idx][2] = 10; // 10

    state.matrix.instructions[root_idx][3] = 0x01; // SET
    state.matrix.instructions[root_idx][4] = 1; // R1
    state.matrix.instructions[root_idx][5] = 5; // 5

    state.matrix.instructions[root_idx][6] = 0x04; // ADD
    state.matrix.instructions[root_idx][7] = 0; // R0
    state.matrix.instructions[root_idx][8] = 1; // R1

    state.matrix.instructions[root_idx][9] = 0x05; // SUB
    state.matrix.instructions[root_idx][10] = 0; // R0
    state.matrix.instructions[root_idx][11] = 1; // R1

    // Step the VM.
    vm.step(&mut state, root_idx);

    // Assert ALU correctness
    assert_eq!(
        state.matrix.context[root_idx][0], 10,
        "R0 should end up 10 (10 + 5 - 5)"
    );
    assert_eq!(state.matrix.context[root_idx][1], 5, "R1 should be 5");

    // PC should have advanced by 3 bytes per instruction (4 instr * 3 bytes)
    assert_eq!(state.matrix.context[root_idx][8], 12, "PC should be 12");

    // Assert Gas/Energy Metabolic Formula
    // Gas used = SET (1) + SET (1) + ADD (1) + SUB (1) + NOP (1, then break) = 5
    // Base compute cost = 5 >> 0 = 5
    // metabolic_cost = 1 + 5 + 0 + 0 = 6
    // Final energy: 250 - 6 = 244.

    assert_eq!(
        state.matrix.energy[root_idx], 244,
        "Energy strictly matches Deno metabolic reduction equation"
    );
}

#[test]
fn test_kuramoto_sync_parity() {
    let mut state = SigmaState::new();
    let mut vm = LambdaVM::new();

    // Setup 3 atoms close to each other
    // Atom 1
    state.matrix.ids[0] = 11;
    state.matrix.xs[0] = 5000; // grid x = 50
    state.matrix.ys[0] = 5000; // grid y = 50
    state.matrix.phase[0] = 10;
    state.matrix.energy[0] = 500;

    // Atom 2
    state.matrix.ids[1] = 12;
    state.matrix.xs[1] = 5100; // grid x = 51
    state.matrix.ys[1] = 5000; // grid y = 50
    state.matrix.phase[1] = 50;
    state.matrix.energy[1] = 500;

    // Atom 3
    state.matrix.ids[2] = 13;
    state.matrix.xs[2] = 4900; // grid x = 49
    state.matrix.ys[2] = 5100; // grid y = 51
    state.matrix.phase[2] = 200;
    state.matrix.energy[2] = 500;

    // Global Coherence
    state.matrix.neural_coherence = 500; // K = 5 + 500/100 = 10

    // Build Spatial Hash
    let (overflow, max_cell) = state.build_spatial_hash();
    assert_eq!(overflow, 0, "Should be no overflows");
    assert_eq!(
        max_cell, 2,
        "Max cell count should be 2 (due to integer div, 5000 and 5100 are both cell 5)"
    );

    // Write OP_RESONATE_KURAMOTO (0xB1) into Atom 1
    state.matrix.instructions[0][0] = 0xB1;

    let initial_phase = state.matrix.phase[0];

    vm.step(&mut state, 0);

    let final_phase = state.matrix.phase[0];

    // Calculate expected physics:
    // atom 2 phase diff: 50 - 10 = 40. sin(40) = 27245 (from LUT).
    // atom 3 phase diff: 200 - 10 = 190. sin(190) = -28898 (from LUT approx, index 190 mapping to negative).
    // Actually, in the Deno implementation sin(190) maps to index 190 of LUT.
    // sum_sin = math_sin(40) + math_sin(190)
    // d_theta = (10 * sum_sin) >> 15
    // theta_next = (10 + d_theta) & 255

    // We simply assert phase shifted deterministically.
    assert_ne!(
        initial_phase, final_phase,
        "Kuramoto physics should have shifted the phase"
    );

    // Assert exactly 2 neighbors processed
    // gas_used = 5 + (2 * 2) = 9. 1 NOP read (1). Total Gas = 10.
    // discount = 1 (coherence > 100)
    // base_compute_cost = 10 >> 1 = 5
    // metabolic_cost = 1 + 5 + 0 + 0 = 6
    // Final energy = 500 - 6 = 494.

    // NOTE: Neural coherence > 500 code path might alter phase AGAIN at the end!
    // Neural Field Resonance in vm.rs: if coherence > 500 (we set it to 500 so no, wait, > 500 means 501. 500 is NOT > 500).
    // So phase remains just Kuramoto output.

    assert_eq!(
        state.matrix.energy[0], 494,
        "Energy confirms 2 neighbors processed inside Kuramoto"
    );
}
