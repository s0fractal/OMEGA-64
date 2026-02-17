
/**
 * [3/7/Y/_.ts]
 * Y Combinator (Fixed Point)
 */
export const ATOM = () => (f: any): any => ((g: any) => g(g))((g: any) => f((x: any) => g(g)(x)));
