
/**
 * [4/5/IS_NIL/_.ts]
 * Nil check
 */
export const ATOM = ({ siblings: { T, F } }) => (l: any) => l((_h: any) => (_t: any) => F)(T);
