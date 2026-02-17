
/**
 * [6/3/CHORD/_.ts]
 * Wave Chord (Superposition of 3 waves)
 */
export const ATOM = ({ siblings: { INTERFERENCE } }) => (h1: any) => (h2: any) => (h3: any) => INTERFERENCE.superpose(h1, INTERFERENCE.superpose(h2, h3, 0), 0);
