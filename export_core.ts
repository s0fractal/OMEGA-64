// OMEGA-64 | export_core.ts | System Consolidation Utility (Era 67)
// Concatenates all core logic files into OMEGA_CORE_LOGIC.md

const CORE_FILES = [
    "GEMINI.md",
    "OFFSETS.ts",
    "STATE_MATRIX.ts",
    "RIBOSOME.ts",
    "IMMUNE.ts",
    "PULSE.ts",
    "PULSE_WORKER.ts",
    "SPATIAL_HASH.ts",
    "GATE.ts",
    "SNAP.ts",
    "SNAPSHOT_ENGINE.ts",
    "LAMBDA_VM.ts",
    "PRNG.ts",
    "RECOVERY.ts",
    "PHYSICS_ENGINE.ts",
    "ECOLOGY_ENGINE.ts",
    "SOVEREIGNTY_ENGINE.ts",
    "SEMANTIC_MEMBRANE.ts",
    "LLM_SYNAPSE.ts",
    "SOVEREIGN_ORACLE.ts",
    "BREATH.ts",
    "OBSERVER_UI.ts",
    "ui/index.html",
    "PREDICTION_MARKET.ts",
    "P2P_FEDERATION.ts",
    "P2P_SYNAPSE.ts",
    "AVATAR_ENGINE.ts",
    "REFLECTION_ENGINE.ts",
    "MATRIX_ENGINE.ts",
    "SYSTEM_START.ts",
    "AUDIT_ENGINE.ts",
    "ENZYME_DIGEST.ts",
    "WASM_MIGRATION_RFC.md",
    "assembly/index.ts",
    "ARCHITECTURE.md",
    "mod.ts",
    "SHIMS.ts",
    "RIBOSOME_TICK.ts",
    "STATE_SNAPSHOT.ts",
    "OBSERVER_LAB.ts",
    "AKASHA_SERVER.ts",
    "AKASHA_UI.html",
    "test_sensory.ts",
    "test_symbiosis.ts",
    "test_tensegrity.ts",
    "test_meiosis.ts",
    "test_mitosis.ts",
    "test_diplomacy.ts",
    "test_cognitive_scaffolding.ts",
    "test_fractal_dividends.ts",
    "test_simhash.ts",
    "test_intent_buffer.ts",
    "test_matrix_engine.ts",
    "test_coherence.ts",
    "test_stability.ts",
    "test_entropy.ts",
    "test_breath.ts",
    "test_automaton.ts",
    "test_risc.ts",
    "run_ecosystem.ts",
    "archive/legacy_docs/GEMINI.md"
];

async function exportCore() {
    let output = "# OMEGA-64 | CORE LOGIC (ERA 69: THE COHERENT LATTICE)\n\n";
    output += `*Generated: ${new Date().toISOString()}*\n\n---\n\n`;

    // @ts-ignore: Deno.readTextFile is valid in Deno
    for (const file of CORE_FILES) {
        try {
            // @ts-ignore: Dynamic filesystem access
            const content = await Deno.readTextFile(file);
            const ext = file.split('.').pop();
            const lang = (ext === 'ts' || ext === 'tsx') ? 'typescript' : (ext === 'html' ? 'html' : 'markdown');
            output += `## FILE: ${file}\n\n\`\`\`${lang}\n${content}\n\`\`\`\n\n---\n\n`;
        } catch (e: any) {
            console.warn(`[SKIP] Could not read ${file}:`, e.message);
        }
    }

    // @ts-ignore: Deno.writeTextFile is valid in Deno
    await Deno.writeTextFile("OMEGA_CORE_LOGIC.md", output);
    console.log("✅ OMEGA_CORE_LOGIC.md successfully updated with Era 69: The Coherent Lattice components.");
}

// @ts-ignore: import.meta.main is Deno specific
if (import.meta.main) {
    await exportCore();
}
