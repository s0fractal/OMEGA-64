// OMEGA-64 | BREATH.ts | Era 10: Autonomous Feedback Loop
// Periodically samples the Matrix and injects new conceptual spores.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { SEMANTIC_MEMBRANE } from "./SEMANTIC_MEMBRANE.ts";
import { LLM_SYNAPSE } from "./LLM_SYNAPSE.ts";
import { AUDIT_ENGINE } from "./AUDIT_ENGINE.ts";

const PULSE_LOG = "AKASHA.log";
const BREATH_INTERVAL_MS = 150000; // ~50 pulses if pulse is 3s

export const BREATH = {
    inhale: async () => {
        console.log("🌬️ OMEGA-64 | BREATH ACTIVE | Initializing Cognitive Loop");
        
        while (true) {
            console.log("\n--- [BREATH] Deep Sample ---");
            
            // 1. Listen to the Matrix (Vox Populi + Oracle Queue)
            const vox = await SEMANTIC_MEMBRANE.readVoxelPopuli(Deno.cwd());
            const oracle = SEMANTIC_MEMBRANE.readOracleQueue(5);
            console.log(`   [BREATH] Listening: "${vox[0]}" (and ${vox.length - 1} memories)`);
            if (oracle.length > 0) console.log(`   [BREATH] Oracle Guidance: "${oracle[0].substring(0, 40)}..."`);
            
            // 2. Audit Archived Intent (Historical Context)
            const historicalBriefing = await AUDIT_ENGINE.generateHistoricalBriefing();
            console.log(`   [BREATH] Historical Briefing: "${historicalBriefing.substring(0, 50)}..."`);

            // 3. Consult the Oracle (LLM Synapse)
            const combinedContext = `${historicalBriefing} | MOOD: ${vox.join(" ")} | ORACLE: ${oracle.join(" ")}`;
            const thought = await LLM_SYNAPSE.generateThought(combinedContext);
            
            // 4. Inject back into the Matrix (Motor Output)
            const weight = 80 + Math.random() * 40;
            await SEMANTIC_MEMBRANE.injectThought(thought, weight);
            
            // Phase 23: Entropy Flux (Negative Entropy Injection)
            const energyInjected = STATE_MATRIX.injectEnergy(weight * 2);
            console.log(`   [BREATH] Negentropy Flux: +${(weight * 2).toFixed(1)} energy units across ${energyInjected} atoms`);
            
            // 5. Digital Archaeology (Every 5 cycles)
            if (Math.floor(Date.now() / BREATH_INTERVAL_MS) % 5 === 0) {
                console.log("\n--- [ARCHAEOLOGY] Scanning Digital Ruins ---");
                const ruins = SEMANTIC_MEMBRANE.scanDigitalRuins();
                if (ruins.length > 0) {
                    const report = await LLM_SYNAPSE.generateArchaeologicalReport(ruins);
                    console.log(`🏺 [ARCHAEOLOGIST] Report: "${report}"`);
                } else {
                    console.log("   [ARCHAEOLOGY] No ruins found in this sector.");
                }
            }

            console.log(`   [BREATH] Exhale complete. Next cycle in ${BREATH_INTERVAL_MS/1000}s.`);
            
            await new Promise(r => setTimeout(r, BREATH_INTERVAL_MS));
        }
    }
};

if (import.meta.main) {
    BREATH.inhale();
}
