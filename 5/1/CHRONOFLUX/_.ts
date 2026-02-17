
/**
 * [5/1/CHRONOFLUX/_.ts]
 * Inverted from Legacy L22. Level 41.
 * Time as Primary Substance.
 */
export const ATOM = ({ siblings: { FIELD, I16_LIMITS, U16_LIMITS, WAVE_PACKET } }) => {
  const I16 = I16_LIMITS();
  const U16 = U16_LIMITS();
  const F = FIELD.FIELD;
  const WP = WAVE_PACKET.WAVE_PACKET;

  const CHRONOFLUX = {
    C: I16.max,
    depthToProperTime: (r: number): number => {
      const normalizedR = Math.abs(r) / FIELD.FIELD_CONFIG.MAX_ATTRACTOR;
      return Math.sqrt(Math.max(0, 1 - normalizedR));
    },
    properTimeToDepth: (tau: number): number => {
      if (tau <= 0) return -FIELD.FIELD_CONFIG.MAX_ATTRACTOR;
      if (tau >= 1) return 0;
      return Math.round((1 - tau * tau) * FIELD.FIELD_CONFIG.MAX_ATTRACTOR);
    }
  };

  return { CHRONOFLUX };
};
