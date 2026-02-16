/**
 * @omega.vector 32.13.00
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L09.core.ATTENTION.ts
 * @omega.symbol ATTENTION
 */

import { FORCE } from "./FORCE.ts";

export const ATTENTION = (f: any) => (filter: any) => (p: any) => filter(p) ? f(p) : FORCE(p);
