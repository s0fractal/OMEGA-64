
/**
 * [0/1/B/_.ts]
 * Church Encoding: B Combinator (Composition)
 * Bfgx = f(gx)
 */
export const ATOM = () => (f: any) => (g: any) => (x: any) => f(g(x));
