
/**
 * [1/2/C/_.ts]
 * Church Encoding: C Combinator (Exchange)
 * Cfxy = fyx
 */
export const ATOM = () => (f: any) => (x: any) => (y: any) => f(y)(x);
