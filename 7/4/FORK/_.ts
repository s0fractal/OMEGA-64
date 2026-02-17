
/**
 * [7/4/FORK/_.ts]
 * Functional fork (Fan-out)
 */
export const ATOM = ({ siblings: { CONS } }) => (x: any) => (f: any) => (g: any) => CONS(f(x))(g(x));
