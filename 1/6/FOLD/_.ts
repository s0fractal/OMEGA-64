
/**
 * [1/6/FOLD/_.ts]
 * List fold (reduce) logic
 */
export const ATOM = ({ siblings: { Y, IS_NIL, CAR, CDR } }) => 
    Y((r: any) => (f: any) => (acc: any) => (l: any) => 
        IS_NIL(l) ? acc : r(f)(f(acc)(CAR(l)))(CDR(l))
    );
