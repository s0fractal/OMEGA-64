
/**
 * [0/6/XOR/_.ts]
 * Church Encoding: XOR logic.
 */
export const ATOM = ({ siblings: { NOT } }) => (p: any) => (q: any) => p(NOT(q))(q);
