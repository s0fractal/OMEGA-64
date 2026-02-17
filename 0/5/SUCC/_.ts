
/**
 * [0/5/SUCC/_.ts]
 * Church Encoding: Successor function.
 */
export const ATOM = () => (n: any) => (f: any) => (x: any) => f(n(f)(x));
