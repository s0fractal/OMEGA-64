// SSoT: file:///Users/s0fractal/OMEGA/I/substrate/prng_next.md

/**
 * Generates the next value and the subsequent state for the PRNG.
 * @param state The current seed state.
 * @returns { value: number, nextState: number }
 */
export function prng_next(state: number): { value: number; nextState: number } {
  // LCG constants from Numerical Recipes
  const nextState = (state * 1664525 + 1013904223) >>> 0;
  return {
    value: nextState / 0xFFFFFFFF,
    nextState,
  };
}
