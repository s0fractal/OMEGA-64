/**
 * @omega.vector 32.14.03
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L36.core.LENS.ts
 * @omega.symbol LENS
 */

import { CONS } from "./CONS.ts";

export const LENS = (g: any) => (s: any) => CONS(g)(s);
