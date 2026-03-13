use sigma_core::isa::GlyphOp;
use sigma_core::ontology_gen::L01::MAX_ATOMS;
use sigma_core::{PulseOrchestrator, SigmaState};

#[test]
fn test_sovereign_500k_stress() {
    let mut state = SigmaState::new();

    // Inject Genesis Bytecode
    let replicator_logic = [
        GlyphOp::Sense as u8,
        0,
        GlyphOp::Sense as u8,
        0,
        GlyphOp::Plug as u8,
        0,
        GlyphOp::Nop as u8,
        0,
    ];

    for i in 0..MAX_ATOMS {
        state.matrix.ids[i] = (i + 1) as u64;
        state.matrix.energy[i] = 100;
        state.matrix.resonance[i] = 50;

        let lx = (i % GRID_W) as i16;
        let ly = ((i / GRID_W) % GRID_H) as i16;
        state.matrix.xs[i] = lx;
        state.matrix.ys[i] = ly;

        state.matrix.logic[i].copy_from_slice(&replicator_logic);
    }

    let mut visited = vec![0u8; MAX_ATOMS];
    let mut orchestrator = PulseOrchestrator::new(&mut visited);

    // Run 10 ticks for now to verify deadlock freedom and throughput
    for tick in 1..=10 {
        orchestrator.tick(&mut state, tick);
    }

    // Validations post-stress
    let e = state.matrix.energy[0];
    assert!(e > 0);
}
