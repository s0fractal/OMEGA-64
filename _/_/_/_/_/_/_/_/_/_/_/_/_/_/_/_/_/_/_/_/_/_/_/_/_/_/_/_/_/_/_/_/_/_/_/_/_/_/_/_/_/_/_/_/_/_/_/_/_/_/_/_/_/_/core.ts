// 🛡️ Level 54 Logic (Atomic Operators: Pairs & Lists)
import { T, F } from "./_/_/_/_/_/index.ts"; // Booleans (L59)

/**
 * CONS: Construct Pair
 * CONS x y = λs.s x y
 */
// deno-lint-ignore no-explicit-any
export const CONS = (x: any) => (y: any) => (s: any) => s(x)(y);

/**
 * CAR: First Element of Pair
 * CAR p = p T
 */
// deno-lint-ignore no-explicit-any
export const CAR = (p: any) => p(T);

/**
 * CDR: Second Element of Pair
 * CDR p = p F
 */
// deno-lint-ignore no-explicit-any
export const CDR = (p: any) => p(F);

/** Nil / Empty List: (Equivalent to F or λx.T) */
export const NIL = F;

/** IS_NIL: Checks if a list is empty */
// deno-lint-ignore no-explicit-any
export const IS_NIL = (p: any) => p((_: any) => (_: any) => F)(T);

// Atoms for this level are transfused. (lvl: 54)
