
/**
 * [0/0/IS_ZERO/_.ts]
 * Church Encoding: IS_ZERO predicate.
 */
export const ATOM = ({ siblings: { T, F } }) => (n: any) => n((_: any) => F)(T);
