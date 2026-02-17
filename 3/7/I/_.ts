
/**
 * [3/7/I/_.ts]
 * Church Encoding: I Combinator (Identity)
 * Ix = x
 */
export const ATOM = () => <T>(x: T): T => x;
