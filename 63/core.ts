// 🛡️ Level 63 Logic (Genesis)

/** Axiom K: The Constant Combinator (The Absolute Anchor) */
export const K = <T>(a: T) => <U>(_: U): T => a;

/** Axiom S: The Substitution Combinator (The Engine of Life) */
export const S = <T, U, V>(f: (x: T) => (y: U) => V) => (g: (x: T) => U) => (x: T): V => f(x)(g(x));

// Atoms for this level are transfused. (lvl: 63)
