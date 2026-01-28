// 🛡️ Level 52 Logic (Atomic Operators: Higher Numerals)
import { B } from "./_/_/_/_/_/_/_/_/_/_/index.ts"; // Import B from Identity depth (L62)

/**
 * Multiplication: MULT m n = λm.λn.λf. m (n f)
 * Equivalent to Composition (B)
 */
export const MULT = B;

/**
 * Exponentiation: POW b e = λb.λe. e b
 * (Applying the exponent to the base)
 */
// deno-lint-ignore no-explicit-any
export const POW = (b: any) => (e: any) => e(b);

// Atoms for this level are transfused. (lvl: 52)
