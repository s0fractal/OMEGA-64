
/**
 * [3/7/NOT/_.ts]
 * Church Encoding: NOT logic.
 */
export const ATOM = ({ siblings: { T, F } }) => (p: any) => p(F)(T);
