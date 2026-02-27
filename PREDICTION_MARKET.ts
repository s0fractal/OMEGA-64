// OMEGA-64 | PREDICTION_MARKET.ts | Era 18: Deterministic Monad
// Replaces Parallel Realities. Crisis triggers mutations that atoms bet on.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";

// 16-byte Shared Buffer:
// [0-3]: Int32 isActive (0 or 1)
// [4-7]: Int32 betPool (Scaled by SCALE=1000)
// [8-15]: Uint8Array proposedLogic (8 bytes)
export const marketBuffer = new SharedArrayBuffer(16);
export const marketState = new Int32Array(marketBuffer, 0, 1);
export const betPoolInt = new Int32Array(marketBuffer, 4, 1);
export const proposedLogic = new Uint8Array(marketBuffer, 8, 8);

const CRISIS_THRESHOLD = 5000.0; // The energy threshold required to pass a mutation
const SCALE = 1000;

export const PREDICTION_MARKET = {
    buffer: marketBuffer,

    startCrisis: (newLogic: Uint8Array) => {
        if (Atomics.load(marketState, 0) === 1) {
            console.log("⚠️ [MARKET] A crisis is already ongoing.");
            return;
        }

        console.log(`🌀 [MARKET] CRISIS INITIATED! Proposed Genome: ${Array.from(newLogic).map(b => b.toString(16).padStart(2, '0')).join('')}`);
        
        // Reset pool
        Atomics.store(marketState, 0, 1);
        Atomics.store(betPoolInt, 0, 0);
        
        // Store proposed logic
        for(let i = 0; i < 8; i++) {
            proposedLogic[i] = newLogic[i];
        }
    },

    resolveCrisis: () => {
        if (Atomics.load(marketState, 0) === 0) return;

        Atomics.store(marketState, 0, 0);
        const finalBet = Atomics.load(betPoolInt, 0) / SCALE;

        if (finalBet >= CRISIS_THRESHOLD) {
            console.log(`🌌 [MARKET] MUTATION ADOPTED! Total Energy Bet: ${finalBet.toFixed(2)}. Applying globally...`);
            
            // Apply the mutation to all active atoms in the single STATE_MATRIX
            const active = STATE_MATRIX.getActiveIndices();
            for (const idx of active) {
                // Determine compatibility or survival. 
                // For now, we ruthlessly overwrite their logic with the proposed genome.
                // If they can't survive with this new logic in the physics loop, they will starve.
                STATE_MATRIX.setLogic(idx, proposedLogic);
                
                // Minor energy penalty for adopting the mutation (adaptability toll)
                const currentEnergy = STATE_MATRIX.getEnergy(idx);
                STATE_MATRIX.setEnergy(idx, Math.max(0, currentEnergy - 10)); 
            }
        } else {
            console.log(`🛑 [MARKET] CRISIS AVERTED. Insufficient Energy Bet: ${finalBet.toFixed(2)} / ${CRISIS_THRESHOLD}. Status Quo maintained.`);
        }
    }
};
