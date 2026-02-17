
/**
 * [6/6/ATTENTION/_.ts]
 * Attention (filtered sensation)
 */
export const ATOM = ({ siblings: { FORCE } }) => (f: any) => (filter: any) => (p: any) => filter(p) ? f(p) : FORCE(p);
