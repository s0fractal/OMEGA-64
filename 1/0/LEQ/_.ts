
/**
 * [1/0/LEQ/_.ts]
 * Church Encoding: Less than or equal predicate.
 */
export const ATOM = ({ siblings: { IS_ZERO, SUB } }) => (m: any) => (n: any) => IS_ZERO(SUB(m)(n));
