// 🛡️ Level 59 Logic (Atomic Operators: Booleans)
import { K, I } from "./_/index.ts"; // Import from DNA depth

/** 
 * Church Boolean: TRUE (The Selector of the First) 
 * T = λx.λy.x (equivalent to K)
 */
export const T = K;

/** 
 * Church Boolean: FALSE (The Selector of the Second) 
 * F = λx.λy.y (equivalent to KI)
 */
export const F = <T>(_: T) => I;

/** Logical AND: AND p q = p q p */
// deno-lint-ignore no-explicit-any
export const AND = (p: any) => (q: any) => p(q)(p);

/** Logical OR: OR p q = p p q */
// deno-lint-ignore no-explicit-any
export const OR = (p: any) => (q: any) => p(p)(q);

/** Logical NOT: NOT p = p F T */
// deno-lint-ignore no-explicit-any
export const NOT = (p: any) => p(F)(T);

// Atoms for this level are transfused. (lvl: 59)
