[S_MAP]: S_MAP: Lazy Map over a stream | S_MAP: Apply function f to stream s
(infinite list). | S_MAP = Y (λr.λf.λs. CONS (f (CAR s)) (r f (CDR s))) | //
deno-lint-ignore no-explicit-any
