
/**
 * [3/7/AND/_.ts]
 * Church Encoding: AND logic.
 */
export const ATOM = () => (p: any) => (q: any) => p(q)(p);
