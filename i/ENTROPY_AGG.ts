/**
 * @omega.vector 32.34.01
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L20.core.ENTROPY.ts
 * @omega.symbol ENTROPY
 */

export const BOLTZMANN = {
  k_B: 1.0,
  microstates: (energy: number, temperature: number): number => {
    if (temperature === 0) return energy === 0 ? 1 : 0;
    return Math.exp(-energy / (BOLTZMANN.k_B * temperature));
  },
  lensTemperature: (curvature: number): number => {
    return 1 / (1 + Math.abs(curvature));
  },
  freeEnergy: (energy: number, entropy: number, temperature: number): number => {
    return energy - temperature * entropy;
  },
  shannonEntropy: (probabilities: Float32Array): number => {
    let sum = 0;
    for (let i = 0; i < probabilities.length; i++) {
      const p = probabilities[i];
      if (p > 0) sum += p * Math.log(p);
    }
    return -sum;
  }
};
