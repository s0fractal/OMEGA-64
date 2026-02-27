// OMEGA-64 | export_core.ts | System Consolidation Utility (Era 14)
// Concatenates all core logic files into OMEGA_CORE_LOGIC.md

const CORE_FILES = [
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
    "BREATH.ts",
    "OBSERVER_UI.ts",
    "ui/index.html",
    "PREDICTION_MARKET.ts",
    "P2P_FEDERATION.ts",
    "AVATAR_ENGINE.ts",
    "REFLECTION_ENGINE.ts",
    "SYSTEM_START.ts",
    "ARCHITECTURE.md",
    "mod.ts",
    "archive/legacy_docs/GEMINI.md"
];

async function exportCore() {
    let output = "# OMEGA-64 | CORE LOGIC (ERA 21: GLOBAL GOVERNANCE)\n\n";
    output += `*Generated: ${new Date().toISOString()}*\n\n---\n\n`;

    // @ts-ignore: Deno is available in runtime
    for (const file of CORE_FILES) {
        try {
            // @ts-ignore
            const content = await Deno.readTextFile(file);
            const ext = file.split('.').pop() === 'ts' ? 'typescript' : 'markdown';
            output += `## FILE: ${file}\n\n\`\`\`${ext}\n${content}\n\`\`\`\n\n---\n\n`;
        } catch (e: any) {
            console.warn(`[SKIP] Could not read ${file}:`, e.message);
        }
    }

    // @ts-ignore
    await Deno.writeTextFile("OMEGA_CORE_LOGIC.md", output);
    console.log("✅ OMEGA_CORE_LOGIC.md successfully updated with Era 18 components.");
}

// @ts-ignore
if (import.meta.main) {
    await exportCore();
}
