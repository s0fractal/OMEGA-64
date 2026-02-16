/**
 * @omega.vector 32.01.04
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L63.core.S.ts
 * @omega.symbol S
 */

export const S = <T, U, V>(f: (x: T) => (y: U) => V) => (g: (x: T) => U) => (x: T): V => f(x)(g(x));
