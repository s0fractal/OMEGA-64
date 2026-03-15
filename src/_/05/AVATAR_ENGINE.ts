/** SSoT: {@link ../../ontology/semantic/avatar_engine.md} */

// OMEGA-64 | AVATAR_ENGINE.ts | Era 18: Emergent Avatar
// Transforms observer interaction purely into thermodynamic pheromone deposits.

import { GLYPH_TELEMETRY } from "@06";
import { STATE_MATRIX } from "@00";
import { GRID_W, SCALE } from "../mod.ts";

const getGridIdx = (x: number, y: number) => {
  const gx = Math.floor(x / SCALE);
  const gy = Math.floor(y / SCALE);
  if (gx < 0 || gx >= GRID_W || gy < 0) return 0; // Simple boundary check 
  return gx + gy * GRID_W;
};

export const AVATAR_ENGINE = {
  /**
   * Deposits ATTENTION pheromones into the physics grid at cursor locations.
   * Atoms will naturally react to this scent based on their genetic logic.
   */
  dropPheromone: (x: number, y: number, intensity: number = 100) => {
    GLYPH_TELEMETRY.depositPheromone(x, y, intensity);
    const idx = getGridIdx(x, y);
    const coreDelta = Math.max(1, Math.min(1000, intensity));
    const haloDelta = Math.max(1, Math.min(1000, coreDelta * 0.25));

    // Spill a highly concentrated dose of attention at the cursor
    // Capped to prevent float overflow or infinite pooling
    const current = STATE_MATRIX.attentionField[idx];
    if (current < 1000) {
      STATE_MATRIX.attentionField[idx] += coreDelta;
    }

    // Also spill slightly into immediate neighbors to create a gradient
    const checkPoints = [[0, -20], [0, 20], [-20, 0], [20, 0]];
    for (const [ox, oy] of checkPoints) {
      const sIdx = getGridIdx(x + ox, y + oy);
      const sCurrent = STATE_MATRIX.attentionField[sIdx];
      if (sCurrent < 1000) {
        STATE_MATRIX.attentionField[sIdx] += haloDelta;
      }
    }
  },
};
