/**
 * @omega.vector 32.02.00
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L32.core.CONS.ts
 * @omega.symbol CONS
 */

export const CONS = (x: any) => (y: any) => (s: any) => s(x)(y);
