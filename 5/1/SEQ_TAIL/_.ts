
/**
 * [5/1/SEQ_TAIL/_.ts]
 * Sequence access: tail
 */
export const ATOM = ({ siblings: { CDR } }) => (s: any) => CDR(s);
