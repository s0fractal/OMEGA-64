
/**
 * [6/1/MAP/_.ts]
 * Map function for lists (Church encoded)
 */
export const ATOM = ({ siblings: { Y, IS_NIL, NIL, CONS, CAR, CDR } }) => 
    Y((r: any) => (f: any) => (l: any) => 
        IS_NIL(l) ? NIL : CONS(f(CAR(l)))(r(f)(CDR(l)))
    );
