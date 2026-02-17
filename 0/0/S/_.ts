
/**
 * [0/0/S/_.ts]
 * Church Encoding: S Combinator (Strong Composition)
 * Sxyz = xz(yz)
 */
export const ATOM = () => <T, U, V>(f: (x: T) => (y: U) => V) => (g: (x: T) => U) => (x: T): V => f(x)(g(x));
