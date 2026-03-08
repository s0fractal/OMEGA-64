[MAP]: MAP: Apply f to each element of list l | MAP = Y (λr.λf.λl. IS_NIL l NIL
(CONS (f (CAR l)) (r f (CDR l)))) | MAP: Apply f to each element of list l | MAP
= Y (λr.λf.λl. IS_NIL l NIL (CONS (f (CAR l)) (r f (CDR l)))) | //
deno-lint-ignore no-explicit-any
