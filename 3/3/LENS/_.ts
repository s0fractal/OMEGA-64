
/**
 * [3/3/LENS/_.ts]
 * Functional Lens (Getter/Setter pair)
 */
export const ATOM = ({ siblings: { CONS } }) => (g: any) => (s: any) => CONS(g)(s);
