/**
 * @omega.vector 32.33.02
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L22.core.SEQUENCE.ts
 * @omega.symbol SEQUENCE
 */

import { CONS } from "./CONS.ts";

export const SEQUENCE = (a: any) => (b: any) => CONS(a)(b);
