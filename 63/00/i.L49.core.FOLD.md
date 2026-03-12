[FOLD]: FOLD (Right): Accumulate l using f starting with init | FOLD = Y
(λr.λf.λinit.λl. IS_NIL l init (f (CAR l) (r f init (CDR l)))) | FOLD (Right):
Accumulate l using f starting with init | FOLD = Y (λr.λf.λinit.λl. IS_NIL l
init (f (CAR l) (r f init (CDR l)))) | // deno-lint-ignore no-explicit-any
