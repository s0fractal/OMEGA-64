
/**
 * [5/1/INTER_SUB/_.ts]
 * Inter-subjective bridge
 */
export const ATOM = () => (s1: any) => (s2: any) => (p: any) => p(s1)(s2);
