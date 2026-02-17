
/**
 * [1/2/W/_.ts]
 * W Combinator (Duplication)
 * Wfx = fxx
 */
export const ATOM = () => (f: any) => (x: any) => f(x)(x);
