
/**
 * [3/7/CONS/_.ts]
 * Church Encoding: CONS (Pair Constructor)
 */
export const ATOM = () => (x: any) => (y: any) => (s: any) => s(x)(y);
