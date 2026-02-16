/**
 * @omega.vector 32.04.00
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L58.core.SUCC.ts
 * @omega.symbol SUCC
 */

export const SUCC = (n: any) => (f: any) => (x: any) => f(n(f)(x));
