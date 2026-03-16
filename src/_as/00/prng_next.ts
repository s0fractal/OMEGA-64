// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/substrate/prng_next.md
// @ts-ignore
@inline
export function prng_next(state: u32): u32 {
  return (state * 1664525 + 1013904223);
}