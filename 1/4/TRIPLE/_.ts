
/**
 * [1/4/TRIPLE/_.ts]
 * Triple data structure
 */
export const ATOM = () => (a: any) => (b: any) => (c: any) => (f: any) => f(a)(b)(c);
