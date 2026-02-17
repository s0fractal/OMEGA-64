
/**
 * [5/7/RESONANCE/_.ts]
 * Wave Resonance logic
 */
export const ATOM = ({ siblings: { WAVE_SIGNAL } }) => (a: any) => (b: any) => (a === b ? WAVE_SIGNAL(a) : WAVE_SIGNAL(b));
