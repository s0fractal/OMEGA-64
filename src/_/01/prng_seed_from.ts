// SSoT: file:///Users/s0fractal/OMEGA/I/substrate/prng_seed_from.md

/**
 * Static helper to derive a seed from tick and atom ID.
 * @param tick Current system tick
 * @param atomId The ID of the atom
 * @returns number 
 */
export function prng_seed_from(tick: number, atomId: string): number {
  let hash = tick;
  for (let i = 0; i < atomId.length; i++) {
    hash = ((hash << 5) - hash) + atomId.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return (hash >>> 0);
}
