// 🛡️ Level 50 Logic (Atomic Operators: Iterators)
import { Y } from "./_/_/_/_/_/_/_/_/_/_/_/index.ts"; // Recursion (L61)
import { CONS, CAR, CDR, NIL, IS_NIL } from "./_/_/_/_/index.ts"; // Lists (L54)

/**
 * MAP: Apply f to each element of list l
 * MAP = Y (λr.λf.λl. IS_NIL l NIL (CONS (f (CAR l)) (r f (CDR l))))
 */
// deno-lint-ignore no-explicit-any
export const MAP = Y((r: any) => (f: any) => (l: any) => 
  IS_NIL(l)
    (NIL)
    (CONS(f(CAR(l)))(r(f)(CDR(l))))
);

/**
 * FOLD (Right): Accumulate l using f starting with init
 * FOLD = Y (λr.λf.λinit.λl. IS_NIL l init (f (CAR l) (r f init (CDR l))))
 */
// deno-lint-ignore no-explicit-any
export const FOLD = Y((r: any) => (f: any) => (init: any) => (l: any) =>
  IS_NIL(l)
    (init)
    (f(CAR(l))(r(f)(init)(CDR(l))))
);

/**
 * FILTER: Select elements from l satisfying p
 * FILTER = Y (λr.λp.λl. IS_NIL l NIL (p (CAR l) (CONS (CAR l) (r p (CDR l))) (r p (CDR l))))
 */
// deno-lint-ignore no-explicit-any
export const FILTER = Y((r: any) => (p: any) => (l: any) =>
  IS_NIL(l)
    (NIL)
    (p(CAR(l))
      (CONS(CAR(l))(r(p)(CDR(l))))
      (r(p)(CDR(l))))
);

// Atoms for this level are transfused. (lvl: 50)
