// 🛡️ Level 36 Logic (Flow Control: Identity Mapping / Lenses)
import { I } from "./_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/index.ts"; // L62 via 27 depth
import { CONS } from "./_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/index.ts"; // L54 via 16 depth

/**
 * MAP_ID: Identity mapping over a structure.
 * λs.s (Returns the structure as is)
 */
export const MAP_ID = I;

/**
 * LENS: A pair of (Getter, Setter)
 * LENS g s = PAIR g s
 */
// deno-lint-ignore no-explicit-any
export const LENS = (g: any) => (s: any) => CONS(g)(s);

/**
 * VIEW: Applied a lens getter to a structure.
 * VIEW (PAIR g s) struct = g struct
 */
// deno-lint-ignore no-explicit-any
export const VIEW = (l: any) => (struct: any) => l((g: any) => (_s: any) => g(struct));

// Atoms for this level are transfused. (lvl: 36)
