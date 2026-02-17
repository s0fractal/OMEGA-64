
/**
 * [5/1/SEQUENCE/_.ts]
 * Immutable sequence constructor
 */
export const ATOM = ({ siblings: { CONS } }) => (h: any) => (t: any) => CONS(h)(t);
