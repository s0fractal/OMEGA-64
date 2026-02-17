
/**
 * [3/2/TELL/_.ts]
 * Writer Monad: outputting a value
 */
export const ATOM = () => (w: any) => (pair: any) => pair(undefined)(w);
