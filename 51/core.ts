// 🛡️ Level 51 Logic (Atomic Operators: Triples & 3-tuples)
/**
 * TRIPLE: Construct a 3-tuple
 * TRIPLE x y z = λs.s x y z
 */
// deno-lint-ignore no-explicit-any
export const TRIPLE = (x: any) => (y: any) => (z: any) => (s: any) => s(x)(y)(z);

/** T1: Select 1st of Triple */
// deno-lint-ignore no-explicit-any
export const T1 = (p: any) => p((x: any) => (_: any) => (_: any) => x);

/** T2: Select 2nd of Triple */
// deno-lint-ignore no-explicit-any
export const T2 = (p: any) => p((_: any) => (y: any) => (_: any) => y);

/** T3: Select 3rd of Triple */
// deno-lint-ignore no-explicit-any
export const T3 = (p: any) => p((_: any) => (_: any) => (z: any) => z);

// Atoms for this level are transfused. (lvl: 51)
