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
            
            const memSummary = STATE_MATRIX.getMemorySummary();
            const oracleResult = await LLM_SYNAPSE.generateAtomicBytecode({ ...telemetry, stigmergicSummary: memSummary });
            
            if (oracleResult && oracleResult.genome) {
                const newBytecode = oracleResult.genome;
                // Verify the Regent is still alive/valid
                if (STATE_MATRIX.getId(regentIndex) !== 0n) {
                    STATE_MATRIX.setLogic(regentIndex, newBytecode);
                    const hex = Array.from(newBytecode).map(b => b.toString(16).padStart(2, '0')).join('');
                    console.log(`⚡ [ORACLE] Genome Overwritten! New Regent Bytecode: [${hex.toUpperCase()}]`);
                    SOVEREIGNTY_ENGINE.currentRegent.genome = hex.toUpperCase();

                    // --- ERA 67: MEMETIC INJECTION ---
                    if (oracleResult.meme) {
                        const memeHex = Array.from(oracleResult.meme).map(b => b.toString(16).padStart(2, '0')).join('');
                        console.log(`🌀 [ORACLE] Memetic Injection! Seeding Grid with: [${memeHex.toUpperCase()}]`);
                        
                        // Seed the 3x3 area around the Regent
                        const rx = Math.floor(STATE_MATRIX.getX(regentIndex) / 10);
                        const ry = Math.floor(STATE_MATRIX.getY(regentIndex) / 10);
                        
                        for (let dx = -1; dx <= 1; dx++) {
                            for (let dy = -1; dy <= 1; dy++) {
                                const gx = rx + dx;
                                const gy = ry + dy;
                                if (gx >= 0 && gx < 140 && gy >= 0 && gy < 80) {
                                    const gridIdx = (gy * 140 + gx) * 8;
                                    // Set energy (1000) + meme (4 bytes)
                                    STATE_MATRIX.memoryGrid.set([0xE8, 0x03, 0x00, 0x00], gridIdx); // 1000 in little endian
                                    STATE_MATRIX.memoryGrid.set(oracleResult.meme, gridIdx + 4);
                                }
                            }
                        }
                    }
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
