
/**
 * [1/7/S_MAP/_.ts]
 * Stream map operation
 */
export const ATOM = ({ siblings: { Y, CAR, CDR, CONS } }) => 
    Y((r: any) => (f: any) => (s: any) => CONS(f(CAR(s)))(r(f)(CDR(s))));
