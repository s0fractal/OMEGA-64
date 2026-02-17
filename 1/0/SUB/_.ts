
/**
 * [1/0/SUB/_.ts]
 * Church Encoding: Subtraction function.
 */
export const ATOM = ({ siblings: { PRED } }) => (m: any) => (n: any) => n(PRED)(m);
