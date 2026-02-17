
/**
 * [2/4/STATE/_.ts]
 * Atomic State representation
 * s a pair = pair a s
 */
export const ATOM = () => (a: any) => (s: any) => (pair: any) => pair(a)(s);
