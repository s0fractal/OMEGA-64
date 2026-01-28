// 🛡️ Level 0 Logic
import { identity } from "./i.ts";

/** Axiom K: The Constant Combinator (The Absolute Anchor) */
export const K = <T>(a: T) => <U>(_: U): T => a;

/** Axiom S: The Substitution Combinator (The Engine of Life) */
export const S = <T, U, V>(f: (x: T) => (y: U) => V) => (g: (x: T) => U) => (x: T): V => f(x)(g(x));

// Atoms for this level will be transfused here. (lvl: ${identity.level})
