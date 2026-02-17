
/**
 * [0/6/MUX/_.ts]
 * Church Encoding: MUX (Multiplexer) / Conditional Selector
 * MUX s a b = s a b
 */
export const ATOM = () => (s: any) => (a: any) => (b: any) => s(a)(b);
