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
