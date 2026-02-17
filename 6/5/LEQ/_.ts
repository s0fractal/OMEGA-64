
/**
 * [6/5/LEQ/_.ts]
 * Less than or equal comparison
 */
export const ATOM = ({ siblings: { IS_ZERO, SUB } }) => (m: any) => (n: any) => IS_ZERO(SUB(m)(n));
