
/**
 * [3/7/OR/_.ts]
 * Church Encoding: OR logic.
 */
export const ATOM = () => (p: any) => (q: any) => p(p)(q);
