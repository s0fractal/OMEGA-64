// 🛡️ Level 1 Logic
import { identity } from "./i.ts";
// 🛡️ Level 62 Logic

/** Axiom I: The Identity Combinator (The Mirror) */
export const I = <T>(x: T): T => x;

/** Axiom B: The Composition Combinator (Bluebird / The Link) */
export const B = <T, U, V>(f: (u: U) => V) => (g: (t: T) => U) => (x: T): V => f(g(x));

// Atoms for this level are transfused. (lvl: 62)
