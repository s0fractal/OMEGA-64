
/**
 * [0/0/K/_.ts]
 * Church Encoding: K Combinator (Constant)
 * Kxy = x
 */
export const ATOM = () => <T>(a: T) => <U>(_: U): T => a;
