// OMEGA-64 | AVATAR_ENGINE.ts | Era 13: ALEPH
// Gravitational physics for the God-Atom (Observer Avatar).

import { STATE_MATRIX, GOD_ATOM_INDEX } from "./STATE_MATRIX.ts";

export const AVATAR_ENGINE = {
    /**
     * Applies gravitational pull from the Avatar (Index 0) to nearby atoms.
     * Atoms near the avatar also gain a resonance boost.
     */
    applyInfluence: () => {
        const ax = STATE_MATRIX.getX(GOD_ATOM_INDEX);
        const ay = STATE_MATRIX.getY(GOD_ATOM_INDEX);
        const active = STATE_MATRIX.getActiveIndices();

        // Constants for the Avatar influence
        const GRAVITY_STRENGTH = 0.05;
        const RESONANCE_BOOST = 1.0;
        const RADIUS = 250;
        const RADIUS_SQ = RADIUS * RADIUS;

        for (const i of active) {
            if (i === GOD_ATOM_INDEX) continue;

            const dx = ax - STATE_MATRIX.getX(i);
            const dy = ay - STATE_MATRIX.getY(i);
            const distSq = dx * dx + dy * dy;

            if (distSq < RADIUS_SQ && distSq > 1) {
                const dist = Math.sqrt(distSq);
                
                // 1. Gravitational Pull (Physics)
                const pull = (GRAVITY_STRENGTH * (RADIUS - dist)) / RADIUS;
                STATE_MATRIX.setX(i, STATE_MATRIX.getX(i) + (dx / dist) * pull);
                STATE_MATRIX.setY(i, STATE_MATRIX.getY(i) + (dy / dist) * pull);

                // 2. Resonance Boost (Conceptual)
                const currentRes = STATE_MATRIX.getResonance(i);
                STATE_MATRIX.setResonance(i, currentRes + (RESONANCE_BOOST / (dist + 10)));
            }
        }
    }
};
