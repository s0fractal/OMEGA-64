// OMEGA-64 | SOVEREIGNTY_ENGINE.ts | The Governance Layer
// Handles Regent Election, Decrees, and Legitimacy.

import { STATE_MATRIX } from "./STATE_MATRIX.ts";
import { IDX_TO_ID } from "./RIBOSOME.ts";

export const DECREES: Record<string, any> = {
    "NONE": { decay: 1.0, speed: 1.0, mutation: 1.0, label: "DEMOCRACY" },
    "LUXURY_TAX": { decay: 2.5, speed: 1.0, mutation: 1.0, label: "LUXURY TAX" }, 
    "IMMUNE_SHIELD": { decay: 0.3, speed: 0.7, mutation: 0.5, label: "IMMUNE SHIELD" },
    "MUTATIVE_FEVER": { decay: 1.5, speed: 1.3, mutation: 4.0, label: "MUTATIVE FEVER" },
    "VOID_STASIS": { decay: 0.5, speed: 0.2, mutation: 0.1, label: "VOID STASIS" }
};

export const SOVEREIGNTY_ENGINE = {
    currentRegent: {
        idx: -1,
        energy: 0,
        genome: "NONE",
        legitimacy: 0,
        activeDecree: "NONE",
        mods: DECREES["NONE"]
    },

    // Elect a Regent based on Quadratic Voting (Mitigates whale attacks)
    electRegent: (activeIndices: number[]) => {
        let bestPower = 0;
        let regentIdx = -1;

        for (const idx of activeIndices) {
            const res = STATE_MATRIX.getResonance(idx);
            // --- ERA 8: QUADRATIC VOTING ---
            const power = Math.sqrt(res); 
            
            if (power > 10 && power > bestPower) {
                bestPower = power;
                regentIdx = idx;
            }
        }

        if (regentIdx !== -1) {
            const filename = IDX_TO_ID.get(regentIdx)!;
            const logicBytes = STATE_MATRIX.getLogic(regentIdx);
            const logicStr = Array.from(logicBytes).map(b => b.toString(16).padStart(2, '0')).join('');
            
            // Select a decree based on the first digit of the regent's logic
            const logicDigit = parseInt(logicStr[0], 16);
            let activeDecree = "NONE";
            if (logicDigit <= 3) activeDecree = "IMMUNE_SHIELD";
            else if (logicDigit <= 7) activeDecree = "LUXURY_TAX";
            else if (logicDigit <= 11) activeDecree = "MUTATIVE_FEVER";
            else activeDecree = "VOID_STASIS";

            SOVEREIGNTY_ENGINE.currentRegent = {
                idx: regentIdx,
                energy: STATE_MATRIX.getEnergy(regentIdx),
                genome: logicStr,
                legitimacy: bestPower * bestPower, // Return raw resonance for display
                activeDecree,
                mods: DECREES[activeDecree]
            };
            return SOVEREIGNTY_ENGINE.currentRegent;
        }

        SOVEREIGNTY_ENGINE.currentRegent = {
            idx: -1,
            energy: 0,
            genome: "NONE",
            legitimacy: 0,
            activeDecree: "NONE",
            mods: DECREES["NONE"]
        };
        return SOVEREIGNTY_ENGINE.currentRegent;
    },

    // Elect a Regent by swarm consensus — the dominant colony nominates its best member.
    // Colony = group of atoms sharing the same first 4 bytes of logic (genome prefix).
    electColonyRegent: (activeIndices: number[]): { regent: typeof SOVEREIGNTY_ENGINE.currentRegent; colonySize: number; colonyGenome: string } => {
        // Collect counts by genome prefix
        const genomeCounts = new Map<number, number[]>(); // prefix → [indices]
        for (const idx of activeIndices) {
            const logicBytes = STATE_MATRIX.getLogic(idx);
            const view = new DataView(logicBytes.buffer, logicBytes.byteOffset);
            const prefix = view.getUint32(0, true);
            if (!genomeCounts.has(prefix)) genomeCounts.set(prefix, []);
            genomeCounts.get(prefix)!.push(idx);
        }

        // Find dominant colony (largest group with ≥ 3 members)
        let dominantPrefix = 0;
        let dominantMembers: number[] = [];
        for (const [prefix, members] of genomeCounts.entries()) {
            if (members.length >= 3 && members.length > dominantMembers.length) {
                dominantPrefix = prefix;
                dominantMembers = members;
            }
        }

        if (dominantMembers.length === 0) {
            return { regent: SOVEREIGNTY_ENGINE.currentRegent, colonySize: 0, colonyGenome: "NONE" };
        }

        // Elect most energetic member of the dominant colony as Regent
        let bestEnergy = 0;
        let regentIdx = dominantMembers[0];
        for (const idx of dominantMembers) {
            const e = STATE_MATRIX.getEnergy(idx);
            if (e > bestEnergy) { bestEnergy = e; regentIdx = idx; }
        }

        const logicBytes = STATE_MATRIX.getLogic(regentIdx);
        const colonyGenome = Array.from(logicBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        const logicDigit = parseInt(colonyGenome[0], 16);
        let activeDecree = "NONE";
        if (logicDigit <= 3) activeDecree = "IMMUNE_SHIELD";
        else if (logicDigit <= 7) activeDecree = "LUXURY_TAX";
        else if (logicDigit <= 11) activeDecree = "MUTATIVE_FEVER";
        else activeDecree = "VOID_STASIS";

        SOVEREIGNTY_ENGINE.currentRegent = {
            idx: regentIdx,
            energy: bestEnergy,
            genome: colonyGenome,
            legitimacy: dominantMembers.length * Math.sqrt(bestEnergy),
            activeDecree,
            mods: DECREES[activeDecree]
        };

        return {
            regent: SOVEREIGNTY_ENGINE.currentRegent,
            colonySize: dominantMembers.length,
            colonyGenome
        };
    }
};
