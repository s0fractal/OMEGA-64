
/**
 * [0/0/POTENTIAL/_.ts]
 * Inverted from Legacy L-1. Level 64 (Out of bounds, Genesis).
 * Probabilistic space before form.
 */
export interface PotentialField {
    density: Float32Array;
    entropy: number;
    gradient?: Float32Array;
}

export const ATOM = () => {
    const seededRNG = (seed: number) => () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
    };

    const computeGradient = (density: Float32Array): Float32Array => {
        const grad = new Float32Array(density.length);
        for (let i = 1; i < density.length - 1; i++) {
            grad[i] = (density[i+1] - density[i-1]) / 2;
        }
        return grad;
    };

    return {
        computeGradient,
        sample: (field: PotentialField, seed: number) => {
            const rng = seededRNG(seed);
            let maxDensity = 0, maxIndex = 0;
            for (let i = 0; i < field.density.length; i++) {
                if (field.density[i] > maxDensity) { maxDensity = field.density[i]; maxIndex = i; }
            }
            const noise = (rng() - 0.5) * field.entropy;
            const r = Math.round((maxIndex / field.density.length - 0.5) * 65535 + noise * 32767);
            return { r: Math.max(-32768, Math.min(32767, r)), confidence: maxDensity / (maxDensity + field.entropy) };
        }
    };
};
