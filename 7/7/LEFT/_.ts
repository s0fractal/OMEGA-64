
/**
 * [7/7/LEFT/_.ts]
 * Left projection (Either/Pair)
 */
export const ATOM = () => (x: any) => (l: any) => (_r: any) => l(x);
