
/**
 * [2/4/GET/_.ts]
 * Get state (IO)
 */
export const ATOM = () => (s: any) => (pair: any) => pair(s)(s);
