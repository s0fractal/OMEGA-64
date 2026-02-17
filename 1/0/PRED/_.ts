
/**
 * [1/0/PRED/_.ts]
 * Church Encoding: Predecessor function.
 */
export const ATOM = () => (n: any) => (f: any) => (x: any) => n((g: any) => (h: any) => h(g(f)))((_: any) => x)((u: any) => u);
