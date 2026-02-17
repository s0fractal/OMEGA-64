
/**
 * [7/7/ACCESS_BY_RESONANCE/_.ts]
 * Inverted from Legacy L00.
 * Social Physics | Access by Resonance.
 */
export const ATOM = ({ siblings: { I16_LIMITS, U16_LIMITS } }) => {
  const I16 = I16_LIMITS();
  const U16 = U16_LIMITS();

  const ACCESS_BY_RESONANCE = {
    check: (object: any, agent: any): string => {
      const phi1 = object.phase ?? 0;
      const phi2 = agent.phase ?? 0;
      let dPhi = Math.abs(phi1 - phi2);
      if (dPhi > I16.max) {
        dPhi = U16.span - dPhi;
      }
      const dissonance = dPhi / I16.max;
      const resonance = 1 - dissonance;
      const stabilityFactor = (object.stability ?? 1) * (agent.stability ?? 1);
      const coupling = resonance * stabilityFactor;

      if (coupling > 0.9) return "MERGE";
      if (coupling > 0.7) return "WRITE";
      if (coupling > 0.4) return "INTERACT";
      if (coupling > 0.1) return "READ";
      return "NULL";
    },
    cost: (level: string, coupling: number): number => {
      const baseCost = 10;
      const resistance = coupling > 0.01 ? 1 / (coupling * coupling) : 1000;
      switch (level) {
        case "MERGE": return baseCost * resistance * 10;
        case "WRITE": return baseCost * resistance * 5;
        case "INTERACT": return baseCost * resistance * 2;
        case "READ": return baseCost * resistance;
        default: return Infinity;
      }
    }
  };

  return { ACCESS_BY_RESONANCE };
};
