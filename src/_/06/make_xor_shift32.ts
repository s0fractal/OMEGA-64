// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/make_xor_shift32.md
import { TYPES } from "@g05";

export const make_xor_shift32 = (seed: number): () => number => {
  let state = (seed >>> 0) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
};
