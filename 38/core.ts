// 🛡️ Level 37 Logic (Flow Control: Topological Neighborhood)
import { PRED } from "./_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/index.ts"; // L55 via 18 depth
import { SUCC } from "./_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/index.ts"; // L58 via 21 depth
import { CONS } from "./_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/index.ts"; // L54 via 17 depth

/**
 * NEIGHBOR: Returns the adjacent levels of n.
 * NEIGHBOR n = PAIR (PRED n) (SUCC n)
 */
// deno-lint-ignore no-explicit-any
export const NEIGHBOR = (n: any) => CONS(PRED(n))(SUCC(n));

/**
 * RADIUS: The distance of a level from the surface (L00).
 * In OMEGA-64, surface distance is simply the level index (as a numeral).
 */
// deno-lint-ignore no-explicit-any
export const RADIUS = (n: any) => n;

// Atoms for this level are transfused. (lvl: 37)
