// 🛡️ Level 56 Logic (Atomic Operators: Relations)
import { T, F } from "./_/_/index.ts"; // Import from Booleans depth (L59 via L57)

/**
 * IS_ZERO: Returns T if n is N0, else F.
 * IS_ZERO n = n (λx.F) T
 */
// deno-lint-ignore no-explicit-any
export const IS_ZERO = (n: any) => n((_: any) => F)(T);

// Atoms for this level are transfused. (lvl: 56)
