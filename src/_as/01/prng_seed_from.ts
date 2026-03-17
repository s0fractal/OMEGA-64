// SSoT: file:///Users/s0fractal/OMEGA/I/substrate/prng_seed_from.md
// @ts-ignore
@inline
export function prng_seed_from(tick: u32, atomId: string): u32 {
  let hash = tick;
  for (let i = 0; i < atomId.length; i++) {
    hash = ((hash << 5) - hash) + atomId.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}