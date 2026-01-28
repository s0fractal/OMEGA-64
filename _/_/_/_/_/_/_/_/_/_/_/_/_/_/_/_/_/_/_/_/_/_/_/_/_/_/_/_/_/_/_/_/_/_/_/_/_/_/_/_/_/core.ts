// 🛡️ Level 40 Logic (Flow Control: Parallelism & Synchronization)
import { CONS } from "./_/_/_/_/_/_/_/_/_/_/_/_/_/_/index.ts"; // Pairs (L54 via 14 steps deep from L40)

/**
 * FORK: Bifurcate a value into two parallel strands.
 * FORK x f g = PAIR (f x) (g x)
 */
// deno-lint-ignore no-explicit-any
export const FORK = (x: any) => (f: any) => (g: any) => CONS(f(x))(g(x));

/**
 * JOIN: Combine two parallel strands using a merger function.
 * JOIN p h = h (CAR p) (CDR p)
 */
// deno-lint-ignore no-explicit-any
export const JOIN = (p: any) => (h: any) => p(h);

/**
 * SYNC: A logical barrier.
 * SYNC = JOIN
 */
export const SYNC = JOIN;

// Atoms for this level are transfused. (lvl: 40)
