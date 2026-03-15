// SSoT: src/ontology/math/prng_next.md

@inline
export function prng_next(state: u32): u32 {
return (state * 1664525 + 1013904223) | 0;
}
