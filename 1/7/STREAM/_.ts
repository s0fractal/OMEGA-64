
/**
 * [1/7/STREAM/_.ts]
 * Lazy stream constructor
 */
export const ATOM = ({ siblings: { CONS } }) => (head: any) => (tailThunk: any) => CONS(head)(tailThunk);
