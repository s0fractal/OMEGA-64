
/**
 * [3/7/CAR/_.ts]
 * Church Encoding: CAR (Pair Head) / First
 */
export const ATOM = ({ siblings: { T } }) => (p: any) => p(T);
