
/**
 * [4/5/SEM_WRAP/_.ts]
 * Semantic Wrapping
 */
export const ATOM = ({ siblings: { CONS } }) => (val: any) => (tag: any) => CONS(val)(tag);
