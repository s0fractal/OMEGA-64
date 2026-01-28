// 🛡️ Level 09 Logic (Deep Resonance: Awareness)
import { FORCE } from "./_/index.ts"; // L10 via 1 depth

/**
 * SENSATION: The immediate impact of a force on an observer.
 * λf.λp. f(p)
 */
// deno-lint-ignore no-explicit-any
export const SENSATION = (f: any) => (p: any) => f(p);

/**
 * PERCEPTION: The interpretation of sensation over time.
 * λs. s
 */
// deno-lint-ignore no-explicit-any
export const PERCEPTION = (s: any) => s;

/**
 * ATTENTION: A focused filter over a field.
 */
// deno-lint-ignore no-explicit-any
export const ATTENTION = (f: any) => (filter: any) => (p: any) => filter(p) ? f(p) : FORCE(p);

// Atoms for this level are transfused. (lvl: 09)
