// OMEGA-64 | SOVEREIGN_ORACLE.ts | Era 67: LLM-Guided Exocortex
// Manages asynchronous LLM interruptions to rewrite Regent genomes dynamically.

import { LLM_SYNAPSE } from "./LLM_SYNAPSE.ts";
import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { SOVEREIGNTY_ENGINE } from "./SOVEREIGNTY_ENGINE.ts";

export const SOVEREIGN_ORACLE = {
    isConsulting: false,
    lastConsultTick: 0,
    guidanceCache: new Set<string>(), // Store Hex strings of successful genomes

    interpretResonance: () => {
        const matrixRes = STATE_MATRIX.getMatrixResonance();
        const clusterSync = STATE_MATRIX.getClusterSync();
        
        // Return a condensed telemetry object for the LLM
        return {
            matrixResonance: matrixRes,
            clusterSync: clusterSync,
            nutrients: 1000, // Placeholder or fetch from ECOLOGY if available
            population: STATE_MATRIX.getActiveIndices().length,
            viralLoad: 0 // Placeholder
        };
    },

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
            const oracleResult = await LLM_SYNAPSE.generateAtomicBytecode({ 
                ...telemetry, 
                energy: STATE_MATRIX.getEnergy(regentIndex),
                stigmergicSummary: memSummary 
            });
            
            if (oracleResult && oracleResult.genome) {
                const newBytecode = oracleResult.genome;
                const hex = Array.from(newBytecode).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
                
                SOVEREIGN_ORACLE.guidanceCache.add(hex);
                if (SOVEREIGN_ORACLE.guidanceCache.size > 100) {
                    // Evict oldest (Set doesn't have easy eviction, but we'll just keep it simple)
                    const first = SOVEREIGN_ORACLE.guidanceCache.values().next().value;
                    SOVEREIGN_ORACLE.guidanceCache.delete(first);
                }

                console.log(`👁️ [ORACLE] Oracle responded with genome of length ${newBytecode.length}`);
                // Verify the Regent is still alive/valid
                if (STATE_MATRIX.getId(regentIndex) !== 0n) {
                    STATE_MATRIX.setLogic(regentIndex, newBytecode);
                    console.log(`⚡ [ORACLE] Genome Overwritten! New Regent Bytecode: [${hex}]`);
                    SOVEREIGNTY_ENGINE.currentRegent.genome = hex;

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
            
            // --- ERA 68: CACHE FALLBACK ---
            if (SOVEREIGN_ORACLE.guidanceCache.size > 0) {
                const cacheArray = Array.from(SOVEREIGN_ORACLE.guidanceCache);
                const cachedHex = cacheArray[Math.floor(Math.random() * cacheArray.length)];
                const bytes = new Uint8Array(8);
                for (let i = 0; i < 8; i++) bytes[i] = parseInt(cachedHex.substring(i * 2, i * 2 + 2), 16);
                
                if (STATE_MATRIX.getId(regentIndex) !== 0n) {
                    STATE_MATRIX.setLogic(regentIndex, bytes);
                    console.log(`♻️ [ORACLE] LLM Offline. Pulling from Canon Cache: [${cachedHex}]`);
                }
            }
        } finally {
            SOVEREIGN_ORACLE.isConsulting = false;
        }
    }
};
