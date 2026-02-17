
/**
 * [5/0/VECTOR/_.ts]
 * N-dimensional vector constructor
 */
export const ATOM = ({ siblings: { CONS } }) => (dim: any) => (values: any) => CONS(dim)(values);
