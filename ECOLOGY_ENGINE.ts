// OMEGA-64 | ECOLOGY_ENGINE.ts | The Biological Layer
// Handles Metabolism, Resonance, Cultural Drift, and Caste Logic.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { PRNG } from "./PRNG.ts";
import { RIBOSOME_TICK } from "./RIBOSOME_TICK.ts";

export const ECOLOGY_ENGINE = {
    // Metabolism: Energy and Resonance decay
    processMetabolism: (idx: number, mods: any) => {
        let energy = STATE_MATRIX.getEnergy(idx);
        let resonance = STATE_MATRIX.getResonance(idx);

        // Passive decay
        energy -= (0.5 * mods.decay);
        resonance *= 0.99;

        // --- ERA 8: RUNTIME ASSERTIONS ---
        if (energy < 0) energy = 0;
        if (resonance < 0) resonance = 0;
        if (resonance > 1000) resonance = 1000;

        STATE_MATRIX.setEnergy(idx, energy);
        STATE_MATRIX.setResonance(idx, resonance);
        
        return { energy, resonance };
    },

    // Cultural Drift: Sync DNA with a partner
    syncDNA: (currentLogic: string, partnerLogic: string, currentOracle: PRNG) => {
        const res1 = currentOracle.next();
        if (res1.value < 0.25 && partnerLogic.length >= 8) {
            const res2 = res1.next.next();
            const hexIdx = Math.floor(res2.value * 8);
            const newLogicArray = currentLogic.split("");
            const pChar = partnerLogic.startsWith("0x") ? partnerLogic[hexIdx+2] : partnerLogic[hexIdx];
            if (pChar) {
                newLogicArray[hexIdx] = pChar.toUpperCase();
                return { logic: newLogicArray.join(""), oracle: res2.next };
            }
        }
        return { logic: currentLogic, oracle: res1.next };
    },

    // Caste Classification
    getClassification: (symbol: string, resonance: number, logic: string) => {
        if (resonance > 50) return "NUCLEUS";
        if (logic.startsWith("1")) return "WORKER";
        if (logic.startsWith("8")) return "GUARDIAN";
        if (logic.startsWith("A")) return "ARCHIVIST";
        if (symbol === "PARASITE") return "PARASITE";
        return "NEUTRAL";
    },

    // ERA 67: Stigmergic Decay
    // Clears the memory grid slowly to ensure only reinforced paths persist.
    processGridDecay: () => {
        const grid = STATE_MATRIX.memoryGrid;
        // Simple decay: every N ticks, randomly clear some cells
        // Or systematically decrement 'intensity' if we define an intensity byte
        for (let i = 0; i < grid.length; i++) {
            if (grid[i] > 0) {
                // Stochastic decay: 5% chance to decrease
                if (Math.random() < 0.05) {
                    grid[i] = Math.max(0, grid[i] - 1);
                }
            }
        }
    }
};
