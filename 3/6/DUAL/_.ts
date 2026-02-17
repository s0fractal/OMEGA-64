
/**
 * [3/6/DUAL/_.ts]
 * Dual representation (Pair wrapper)
 */
export const ATOM = ({ siblings: { CONS } }) => (a: any) => (b: any) => CONS(a)(b);
