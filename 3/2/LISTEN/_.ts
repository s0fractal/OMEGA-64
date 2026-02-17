
/**
 * [3/2/LISTEN/_.ts]
 * Writer Monad: listening to output
 */
export const ATOM = () => (writer: any) => (pair: any) => writer((a: any) => (w: any) => pair(a)(w));
