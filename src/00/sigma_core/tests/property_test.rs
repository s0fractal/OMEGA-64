use proptest::prelude::*;
use sigma_core::memory::SigmaState;
use sigma_core::vm::LambdaVM;
use sigma_core::constants::{MAX_ATOMS, MAX_PC};

proptest! {
    // Fuzzing fetch_instruction across full integer domain
    #[test]
    fn prop_fetch_instruction_never_panics(
        atom_idx in 0usize..MAX_ATOMS + 10_000, 
        pc in 0u8..255u8, 
        offset in 0u8..255u8
    ) {
        let mut state = SigmaState::new();
        let vm = LambdaVM::new();
        
        // Populate random instructions
        if atom_idx < MAX_ATOMS {
            state.matrix.instructions[atom_idx] = [42; 64];
        }

        // Action
        let _inst = vm.fetch_instruction(&state, atom_idx, pc, offset);
        // Assert: No panics implies safety bounds worked (.get().unwrap_or(0))
    }

    // Fuzzing bond resolution indices
    #[test]
    fn prop_resolve_bond_requests_never_panics(
        req_count in 0..10_000usize,
        initiators in prop::collection::vec(1..=(MAX_ATOMS as i32 + 5000), 100),
        targets in prop::collection::vec(1..=(MAX_ATOMS as i32 + 5000), 100)
    ) {
        let mut state = SigmaState::new();
        
        let actual_reqs = req_count.min(500_000);
        state.matrix.bond_requests[0] = actual_reqs as i32;

        for i in 1..=actual_reqs.min(100) {
            let idx = (i % 100) as usize;
            state.matrix.bond_requests[i * 2 - 1] = initiators[idx];
            state.matrix.bond_requests[i * 2] = targets[idx];
        }

        // Action
        let resolved = state.resolve_bond_requests();
        
        // Assert
        prop_assert!(resolved >= 0);
    }
}

proptest! {
    #![proptest_config(ProptestConfig::with_cases(50))]
    // Fuzzing complete VM step execution cycle under absolute thermodynamic chaos
    #[test]
    fn prop_vm_step_fuzz_never_panics(
        atom_idx in 0usize..MAX_ATOMS,
        energy in 0i32..5000i32,
        resonance in 0i32..1000i32,
        inst_bytes in prop::collection::vec(any::<u8>(), 64)
    ) {
        let mut state = SigmaState::new();
        let mut vm = LambdaVM::new();
        state.matrix.ids[atom_idx] = 1;

        // Apply chaos
        state.matrix.energy[atom_idx] = energy;
        state.matrix.resonance[atom_idx] = resonance;
        
        let mut prog = [0u8; 64];
        prog.copy_from_slice(&inst_bytes);
        state.matrix.instructions[atom_idx] = prog;
        
        // Action
        vm.step(&mut state, atom_idx);
        
        // Verification is no-panic bounds
    }
}
