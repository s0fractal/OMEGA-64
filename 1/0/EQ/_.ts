
/**
 * [1/0/EQ/_.ts]
 * Church Encoding: Equality predicate.
 */
export const ATOM = ({ siblings: { LEQ, T, F } }) => (m: any) => (n: any) => LEQ(m)(n)(LEQ(n)(m))(F);
