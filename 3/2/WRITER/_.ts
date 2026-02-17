
/**
 * [3/2/WRITER/_.ts]
 * Writer Monad: value and output pair
 */
export const ATOM = () => (a: any) => (w: any) => (pair: any) => pair(a)(w);
