// i.L99.core.AUTONOMY_METRIC.ts
// OMEGA-64 | The Sovereign Score
// "Measuring the breath of the crystal."

import { MUTATE } from "../../2/4/MUTATE/_.ts";
import { AutonomyState } from "../0/STATE_SNAPSHOT/_.ts";


export interface AutonomyScoreReport {
    score: number;
    levels: AutonomyState;
    weights: { state: number; gov: number; code: number };
    timestamp: number;
}

export const AUTONOMY_METRIC = {
    WEIGHTS: {
        state: 0.3,
        gov: 0.3,
        code: 0.4
    },

    /**
     * Computes the current Autonomy Score [0..1] dynamically.
     */
    compute: async (): Promise<AutonomyScoreReport> => {
        // 1. Check Safe Mutation Window (Code Autonomy)
        const window = await MUTATE.checkSovereignty();
        const codeAutonomy = window.ok ? 1.0 : 0.0;

        // 2. Map Gov Autonomy from Bridge (Placeholder for now, could be scaled)
        const govAutonomy = 0.5; // Crystallization active

        const levels: AutonomyState = {
            state: 1.0, // Swarm/Loop Active
            gov: govAutonomy,
            code: codeAutonomy
        };

        const w = AUTONOMY_METRIC.WEIGHTS;
        const score = (levels.state * w.state) + 
                      (levels.gov * w.gov) + 
                      (levels.code * w.code);
        
        return {
            score,
            levels,
            weights: w,
            timestamp: Date.now()
        };
    }
};
