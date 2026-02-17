
/**
 * [5/5/FLOW/_.ts]
 * Functional flow (Pipe)
 */
export const ATOM = () => (f: any) => (g: any) => (x: any) => g(f(x));
