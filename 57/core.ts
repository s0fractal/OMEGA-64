// 🛡️ Level 57 Logic (Atomic Operators: Logic Gates)
import { T, F, NOT, AND } from "./_/index.ts"; // Import from Booleans depth (L59)

/** 
 * NAND Gate: NOT AND
 * NAND p q = NOT (AND p q)
 */
// deno-lint-ignore no-explicit-any
export const NAND = (p: any) => (q: any) => NOT(AND(p)(q));

/** 
 * XOR Gate: Exclusive OR
 * XOR p q = p (NOT q) q
 */
// deno-lint-ignore no-explicit-any
export const XOR = (p: any) => (q: any) => p(NOT(q))(q);

/** 
 * MUX (Multiplexer): Selector
 * MUX s a b = s a b
 * If s is T, returns a. If s is F, returns b.
 */
// deno-lint-ignore no-explicit-any
export const MUX = (s: any) => (a: any) => (b: any) => s(a)(b);

// Atoms for this level are transfused. (lvl: 57)
