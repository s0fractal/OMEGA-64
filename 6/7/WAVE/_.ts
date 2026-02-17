
/**
 * [6/7/WAVE/_.ts]
 * Oscillatory wave primitive
 */
export const ATOM = () => (t: any) => (freq: any) => Math.sin(2 * Math.PI * freq * t);
