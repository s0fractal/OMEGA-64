
/**
 * [5/3/ENTROPY/_.ts]
 * Physical Entropy (Boltzmann)
 */
export const ATOM = () => ({
  k_B: 1.0,
  microstates: (energy: number, temperature: number): number => {
    if (temperature === 0) return energy === 0 ? 1 : 0;
    return Math.exp(-energy / (1.0 * temperature));
  },
  shannonEntropy: (probabilities: Float32Array): number => {
    let sum = 0;
    for (let i = 0; i < probabilities.length; i++) {
        const p = probabilities[i];
        if (p > 0) sum += p * Math.log(p);
    }
    return -sum;
  }
});
