
/**
 * [7/6/L_JOIN/_.ts]
 * Lattice Join operation
 */
export const ATOM = () => (a: any) => (b: any) => (s: any) => s(a)(b);
