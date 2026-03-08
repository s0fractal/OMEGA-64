// i.L64.core.HOLOGRAM.ts
// 🎭 OMEGA-64 | Holographic Projection Driver
// Prepares internal state for visual consumption (The Face).

import { StateSnapshot } from "./i.L99.core.STATE_SNAPSHOT.ts";
import { CHROMO_STATE } from "./i.L00.core.CHROMO_STATE.ts";
import { I16_LIMITS } from "./i.L00.core.I16_LIMITS.ts";

const I16 = I16_LIMITS();

export interface HologramFrame {
  tick: number;
  width: number;
  height: number;
  // Flat array of RGBA values (4 bytes per cell) or spectral values
  // For simplicity in V1: sparse array of active cells
  cells: Array<{ idx: number; color: string; intensity: number }>;
  meta: {
    bridge_mode: string;
    entropy: number;
  };
}

export const HOLOGRAM = {
  /**
   * Render the State into a Holographic Frame.
   */
  render: (state: StateSnapshot): HologramFrame => {
    const cells: Array<{ idx: number; color: string; intensity: number }> = [];

    // 1. Map State to Color
    // Using L00.CHROMO_STATE logic
    // We map the 64-int16 state vector to a 8x8 grid visualization

    for (let i = 0; i < 64; i++) {
      const val = state.state_i16[i] || 0;
      if (val === 0) continue;

      const normalized = Math.abs(val) / I16.abs; // 0..1
      // Simple mapping:
      // - Positive = Warm colors (Action)
      // - Negative = Cool colors (Receptivity)
      // - Zero = Void

      // Or use proper CHROMO_STATE if we want semantic colors
      // Let's use a simplified heuristic for now:
      const hue = val > 0 ? 30 : 210; // Orange vs Blue
      const k = normalized * 100;
      const l = 50 + (normalized * 20);

      cells.push({
        idx: i,
        color: `hsl(${hue}, ${k}%, ${l}%)`,
        intensity: normalized,
      });
    }

    // Calculate System Entropy (simplified)
    // In real version, use i.L20.ENTROPY
    const entropy = 0.5;

    return {
      tick: state.tick,
      width: 8,
      height: 8,
      cells,
      meta: {
        bridge_mode: "AMBER", // TODO: Get from Gate
        entropy,
      },
    };
  },
};
