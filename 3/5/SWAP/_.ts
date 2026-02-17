
/**
 * [3/5/SWAP/_.ts]
 * Function argument swap: f x y = f y x
 */
export const ATOM = () => (f: any) => (x: any) => (y: any) => f(y)(x);
