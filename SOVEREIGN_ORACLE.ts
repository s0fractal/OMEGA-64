// OMEGA-64 | SOVEREIGN_ORACLE.ts | Era 67: LLM-Guided Exocortex
// Manages asynchronous LLM interruptions to rewrite Regent genomes dynamically.

import { LLM_SYNAPSE } from "./LLM_SYNAPSE.ts";
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";

export const SOVEREIGN_ORACLE = {
    isConsulting: false,

    /**
     * Consults the LLM to dictate new bytecode for the reigning Regent.
     * Operates asynchronously to avoid blocking the PULSE lifecycle.
     */
    consultOracle: async (regentIndex: number, telemetry: any) => {
        if (SOVEREIGN_ORACLE.isConsulting) return; // Prevent concurrent overlaps
        SOVEREIGN_ORACLE.isConsulting = true;
        
        try {
            console.log(`👁️ [ORACLE] Regent ${regentIndex} is consulting the LLM for guidance...`);
            
            const newBytecode = await LLM_SYNAPSE.generateAtomicBytecode(telemetry);
            
            if (newBytecode && newBytecode.length === 8) {
                // Verify the Regent is still alive/valid
                if (STATE_MATRIX.getId(regentIndex) !== 0n) {
                    STATE_MATRIX.setLogic(regentIndex, newBytecode);
                    const hex = Array.from(newBytecode).map(b => b.toString(16).padStart(2, '0')).join('');
                    console.log(`⚡ [ORACLE] Genome Overwritten! New Regent Bytecode: [${hex.toUpperCase()}]`);
                    SOVEREIGNTY_ENGINE.currentRegent.genome = hex.toUpperCase();
                } else {
                    console.log(`👁️ [ORACLE] Regent ${regentIndex} perished before guidance could be delivered.`);
                }
            } else {
                console.log(`👁️ [ORACLE] The Oracle was silent or spoke in riddles (Invalid hex returned).`);
            }
        } catch (err) {
            console.error(`👁️ [ORACLE] Connection severed:`, err);
        } finally {
            SOVEREIGN_ORACLE.isConsulting = false;
        }
    }
};
