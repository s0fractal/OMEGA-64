
/**
 * [1/7/S_TAIL/_.ts]
 * Stream tail access
 */
export const ATOM = ({ siblings: { CDR } }) => (s: any) => CDR(s);
