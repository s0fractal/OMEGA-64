
/**
 * [3/7/CDR/_.ts]
 * Church Encoding: CDR (Pair Tail) / Second
 */
export const ATOM = ({ siblings: { F } }) => (p: any) => p(F);
