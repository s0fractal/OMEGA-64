// OMEGA-64 | AVATAR_ENGINE.ts | Era 18: Emergent Avatar
// Transforms observer interaction purely into thermodynamic pheromone deposits.

import { PHYSICS_ENGINE } from "./PHYSICS_ENGINE.ts";

export const AVATAR_ENGINE = {
    /**
     * Deposits ATTENTION pheromones into the physics grid at cursor locations.
     * Atoms will naturally react to this scent based on their genetic logic.
     */
    dropPheromone: (x: number, y: number) => {
        const idx = PHYSICS_ENGINE.getGridIdx(x, y);
        
        // Spill a highly concentrated dose of attention at the cursor
        // Capped to prevent float overflow or infinite pooling
        const current = PHYSICS_ENGINE.ATTENTION_PHEROMONES[idx];
        if (current < 1000) {
            PHYSICS_ENGINE.ATTENTION_PHEROMONES[idx] += 100.0;
        }

        // Also spill slightly into immediate neighbors to create a gradient
        const checkPoints = [[0, -20], [0, 20], [-20, 0], [20, 0]];
        for (const [ox, oy] of checkPoints) {
            const sIdx = PHYSICS_ENGINE.getGridIdx(x + ox, y + oy);
            const sCurrent = PHYSICS_ENGINE.ATTENTION_PHEROMONES[sIdx];
            if (sCurrent < 1000) {
                PHYSICS_ENGINE.ATTENTION_PHEROMONES[sIdx] += 25.0;
            }
        }
    }
};
