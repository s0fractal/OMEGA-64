
/**
 * [7/2/ENERGY/_.ts]
 * Inverted from Legacy L05. Level 58.
 * Thermodynamics and Proactivity.
 */
export const ATOM = ({ siblings: { FIELD } }) => {
  const F = FIELD.FIELD;

  const ENERGY_ENGINE = {
    calculateDecay: (state: any): number => {
      const potential = F.getPotential(state.r);
      return potential * (1 + (state.tension ?? 0));
    },
    getPainLevel: (state: any): number => {
      const scale = (state.energy === 0) ? 1 : state.energy * 0.1;
      return (state.tension ?? 0) / scale;
    },
    evaluateProactivity: (state: any): { action: boolean; intensity: number } => {
      const pain = ENERGY_ENGINE.getPainLevel(state);
      if (pain > 0.7) {
        return { action: true, intensity: pain };
      }
      return { action: false, intensity: 0 };
    }
  };

  return { ENERGY_ENGINE };
};
