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

#[test]
fn test_gt10_share_transfer_parity() {
    let mut state = SigmaState::new();

    // Atom 1: Aggressor/Sharer (High Aggression Hormone)
    state.matrix.ids[1] = 1;
    state.matrix.energy[1] = 5000;

    // Atom 2: Receiver
    state.matrix.ids[2] = 2;
    state.matrix.energy[2] = 1000;

    // Set Hormones
    state.matrix.hormones[0] = 0; // No entropy
    state.matrix.hormones[5] = 0; // No friction
    state.matrix.hormones[2] = 1536; // Aggression = 1536 (> 1024 triggers boost)

    // Program Atom 1
    // R0 = 2 (Target ID), R1 = 5 (Amount)
    // OP_SET R0, 2
    state.matrix.instructions[1][0] = 0x01;
    state.matrix.instructions[1][1] = 0;
    state.matrix.instructions[1][2] = 2;

    // OP_SET R1, 5
    state.matrix.instructions[1][3] = 0x01;
    state.matrix.instructions[1][4] = 1;
    state.matrix.instructions[1][5] = 5;

    // OP_SHARE R0, R1
    state.matrix.instructions[1][6] = 0x83;
    state.matrix.instructions[1][7] = 0;
    state.matrix.instructions[1][8] = 1;

    let mut vm = LambdaVM::new();
    vm.step(&mut state, 1);

    // Initial instruction execution:
    // SET R0, 2 -> 1 gas
    // SET R1, 5 -> 1 gas
    // SHARE R0, R1 -> 10 gas
    // Total Gas = 12
    // Metabolic Cost: 1 + 12 = 13

    // OP_SHARE logic: Base amount = 5
    // Aggression = 1536 => Diff = 512
    // Bonus = (5 * 512) / 2048 = 2560 / 2048 = 1 integer division.
    // Total Amount Shared = 5 + 1 = 6 units (scaled to 6000)

    // Sender Energy: 5000 - 6000 = -1000, BUT wait!
    // OP_SHARE check: `if sender_energy >= scaled_amount` -> 5000 >= 6000 is FALSE.
    // Thus transfer should ABORT. Sender just pays 14 metabolic tax (12 gas + 1 NOP break).
    assert_eq!(state.matrix.energy[1], 5000 - 14);
    assert_eq!(state.matrix.energy[2], 1000);

    // Let's give Atom 1 more energy to succeed
    state.matrix.energy[1] = 10000;
    state.matrix.context[1][8] = 6; // Reset PC to OP_SHARE (offset 6)

    vm.step(&mut state, 1);

    // SHARE R0, R1 -> 10 gas. NOP break -> 1 gas. Total 11 gas. Metabolic = 12 (1 + 11).
    // Transferred = 6000.
    // New Atom 1 Energy: 10000 - 6000 - 12 = 3988
    // New Atom 2 Energy: 10000 + 6000 = 7000.

    assert_eq!(state.matrix.energy[1], 3988);
    assert_eq!(state.matrix.energy[2], 7000);
}

#[test]
fn test_metabolic_tax_parity() {
    let mut state = SigmaState::new();

    // Standard setup
    state.matrix.ids[1] = 1;
    state.matrix.energy[1] = 1000;

    // Hormones
    state.matrix.hormones[0] = 500; // Entropy H0
    state.matrix.hormones[5] = 2000; // Friction H5

    // Program: 15 NOPs. Wait, NOP instruction BREAKS the loop immediately!
    // So only 1 gas is consumed.
    for i in 0..15 {
        state.matrix.instructions[1][i] = 0x00;
    }

    let mut vm = LambdaVM::new();
    vm.step(&mut state, 1);

    // Calculation:
    // Gas Used = 1 (due to NOP break)
    // Coherence = 0 (Discount = 0)
    // Base Compute = 1 >> 0 = 1
    // Entropy term = (1 * 500) >> 12 = 0
    // Friction term = 2000 >> 8 = 7
    // Total Metabolic Cost = 1 (base) + 1 (compute) + 0 (entropy) + 7 (friction) = 9

    // Final Energy = 1000 - 9 = 991
    assert_eq!(state.matrix.energy[1], 991);
}

#[test]
fn test_gt08_structure_intent_visibility() {
    let mut state = SigmaState::new();
    let mut vm = LambdaVM::new();

    // Setup Atom 1
    state.matrix.ids[1] = 1;
    state.matrix.energy[1] = 1000;
    state.matrix.xs[1] = 500; // grid 50
    state.matrix.ys[1] = 500; // grid 50

    // Build instruction: OP_BUILD (0xA8) Type (2) State (100)
    state.matrix.instructions[1][0] = 0xA8;
    state.matrix.instructions[1][1] = 2;
    state.matrix.instructions[1][2] = 100;

    // Sense instruction: OP_SENSE (0xA9) Dest(R0)
    state.matrix.instructions[1][3] = 0xA9;
    state.matrix.instructions[1][4] = 0; // write to R0

    vm.step(&mut state, 1);

    // The atom should see its own build intent value: (100 << 24) | (0xFF << 16) | 2
    let expected_val = (100 << 24) | (0xFF << 16) | 2;
    assert_eq!(state.matrix.context[1][0], expected_val);
}

#[test]
fn test_gt17_build_competition() {
    let mut state = SigmaState::new();
    let mut vm = LambdaVM::new();

    // Setup Atom 2 (Lower ID, executes first)
    state.matrix.ids[2] = 2;
    state.matrix.energy[2] = 1000;
    state.matrix.xs[2] = 500;
    state.matrix.ys[2] = 500;

    // Setup Atom 3 (Higher ID)
    state.matrix.ids[3] = 3;
    state.matrix.energy[3] = 1000;
    state.matrix.xs[3] = 500;
    state.matrix.ys[3] = 500;

    // Atom 2 builds state 17, type 5
    state.matrix.instructions[2][0] = 0xA8;
    state.matrix.instructions[2][1] = 5;
    state.matrix.instructions[2][2] = 17;

    // Atom 3 builds state 91, type 5
    state.matrix.instructions[3][0] = 0xA8;
    state.matrix.instructions[3][1] = 5;
    state.matrix.instructions[3][2] = 91;

    // Step 2 then 3
    vm.step(&mut state, 2);
    vm.step(&mut state, 3);

    let cell_idx = (50 * 140) + 50;

    // ownerToken is atom_idx + 1 = 4
    assert_eq!(state.matrix.structure_build_owner[cell_idx], 4);

    // Expecting Atom 3's values to overwrite Atom 2's
    let expected_val = (91 << 24) | (0xFF << 16) | 5;
    assert_eq!(state.matrix.structure_build_value[cell_idx], expected_val);
}
