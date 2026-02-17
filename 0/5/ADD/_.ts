
/**
 * [0/5/ADD/_.ts]
 * Church Encoding: Addition function.
 */
export const ATOM = () => (m: any) => (n: any) => (f: any) => (x: any) => m(f)(n(f)(x));
