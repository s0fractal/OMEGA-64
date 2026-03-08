[FILTER]: FILTER: Select elements from l satisfying p | FILTER = Y (λr.λp.λl.
IS_NIL l NIL (p (CAR l) (CONS (CAR l) (r p (CDR l))) (r p (CDR l)))) | FILTER:
Select elements from l satisfying p | FILTER = Y (λr.λp.λl. IS_NIL l NIL (p (CAR
l) (CONS (CAR l) (r p (CDR l))) (r p (CDR l)))) | // deno-lint-ignore
no-explicit-any
