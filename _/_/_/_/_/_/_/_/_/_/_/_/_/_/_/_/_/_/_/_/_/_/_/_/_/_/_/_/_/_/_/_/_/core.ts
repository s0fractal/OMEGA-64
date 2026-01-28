// 🛡️ Level 33 Logic (Flow Control: Duality / Inversion)
import { NOT } from "./_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/index.ts"; // L59 via 26 depth
import { SWAP } from "./_/_/_/_/index.ts"; // L34 via 4 depth

/**
 * INV: Logical inversion of a primitive.
 * For booleans, it's NOT.
 */
export const INV = NOT;

/**
 * DUAL: Structural duality.
 * For pairs, it is equivalent to SWAP.
 */
export const DUAL = SWAP;

// Atoms for this level are transfused. (lvl: 33)
