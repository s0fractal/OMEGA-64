// OMEGA-64 | IMMUNE.ts | Stage 26: Immune System Maturity
import { MAX_ATOMS, STATE_MATRIX } from "../00_substrate/mod.ts";

export const IMMUNE = {
  /**
   * isNecrotic: Detects "dead" atoms that are consuming memory but not participating in life.
   * Condition: zero energy AND zero resonance.
   */
  isNecrotic: (idx: number): boolean => {
    const energy = STATE_MATRIX.getEnergy(idx);
    const resonance = STATE_MATRIX.getResonance(idx);
    const id = STATE_MATRIX.getId(idx);

    // An atom is necrotic if it has an ID but no vital signs.
    return id !== 0n && energy <= 0 && resonance <= 0;
  },

  /**
   * isDrifting: Detects atoms that are losing coherence.
   * Thresholds are scaled by entropy_pressure (H0).
   */
  isDrifting: (idx: number, entropyPressure: number): boolean => {
    const energy = STATE_MATRIX.getEnergy(idx);
    const resonance = STATE_MATRIX.getResonance(idx);
    const id = STATE_MATRIX.getId(idx);
    const role = STATE_MATRIX.getRole(idx);

    if (id === 0n) return false;
    if (role === 5) return false; // ROLE_MITOCHONDRIA


    // Base threshold for "weak" atoms.
    // Entropy pressure (H0) modulates how aggressive the cleanup is.
    // Normalized H0 is 0..1000.
    const threshold = (entropyPressure / 1000) * 2.0; // Up to 2.0 energy

    // Atoms with very low energy and resonance are candidates for recycling
    return energy < threshold && resonance < (threshold * 100);
  },

  /**
   * phagocytePass: Scans the matrix and identifies indices for recycling.
   * Returns a list of indices to be purged.
   */
  phagocytePass: (entropyPressure: number): number[] => {
    const purgeList: number[] = [];

    for (let i = 0; i < MAX_ATOMS; i++) {
      if (IMMUNE.isNecrotic(i) || IMMUNE.isDrifting(i, entropyPressure)) {
        purgeList.push(i);
      }
    }

    return purgeList;
  },
};
