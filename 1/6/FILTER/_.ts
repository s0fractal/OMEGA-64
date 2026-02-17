
/**
 * [1/6/FILTER/_.ts]
 * List filter logic
 */
export const ATOM = ({ siblings: { Y, IS_NIL, NIL, CONS, CAR, CDR } }) => 
    Y((r: any) => (p: any) => (l: any) => 
        IS_NIL(l) ? NIL : (p(CAR(l)) ? CONS(CAR(l))(r(p)(CDR(l))) : r(p)(CDR(l)))
    );
