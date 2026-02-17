
/**
 * [7/7/FIELD/_.ts]
 * Inverted from Legacy L00.
 * Dipole Field and Logarithmic Topology.
 */
export const ATOM = ({ siblings: { I16_LIMITS } }) => {
  const I16 = I16_LIMITS();

  const FIELD_CONFIG = {
    ZERO_POINT: 0,
    MAX_ATTRACTOR: I16.max,
    MIN_ATTRACTOR: I16.min,
    LOG_SCALE: 1000,
    COHERENCE_THRESHOLD: 0.85,
    GROOVES: [
      { r: I16.min, depth: 2.0, label: "CORE" },
      { r: 0,      depth: 1.5, label: "EQUATOR" },
      { r: I16.max,  depth: 1.0, label: "SURFACE" }
    ]
  };

  const FIELD = {
    compress: (r: number): number => {
      const sign = r >= 0 ? 1 : -1;
      const absR = Math.abs(r);
      if (absR < FIELD_CONFIG.LOG_SCALE) return r;
      const compressed = (FIELD_CONFIG.LOG_SCALE + Math.log1p((absR - FIELD_CONFIG.LOG_SCALE) / FIELD_CONFIG.LOG_SCALE) * FIELD_CONFIG.LOG_SCALE);
      return sign * compressed;
    },
    expand: (compressedR: number): number => {
      const sign = compressedR >= 0 ? 1 : -1;
      const absC = Math.abs(compressedR);
      if (absC < FIELD_CONFIG.LOG_SCALE) return compressedR;
      const expanded = (Math.exp((absC - FIELD_CONFIG.LOG_SCALE) / FIELD_CONFIG.LOG_SCALE) - 1) * FIELD_CONFIG.LOG_SCALE + FIELD_CONFIG.LOG_SCALE;
      return Math.max(FIELD_CONFIG.MIN_ATTRACTOR, Math.min(FIELD_CONFIG.MAX_ATTRACTOR, sign * Math.round(expanded)));
    },
    getPotential: (r: number): number => {
      const compressed = FIELD.compress(r);
      let basePotential = (compressed * compressed) * 0.00001;
      FIELD_CONFIG.GROOVES.forEach(groove => {
        const dist = Math.abs(FIELD.compress(r) - FIELD.compress(groove.r));
        const well = -groove.depth / (1 + dist / 100); 
        basePotential += well;
      });
      return basePotential;
    },
    getTension: (r1: number, r2: number, coherence: number): number => {
      const delta = Math.abs(FIELD.compress(r1) - FIELD.compress(r2));
      return delta * coherence;
    }
  };

  return { FIELD_CONFIG, FIELD };
};
