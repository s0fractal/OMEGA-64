/**
 * @omega.vector 32.18.06
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L26.core.SEM_WRAP.ts
 * @omega.symbol SEM_WRAP
 */

import { CONS } from "./CONS.ts";

export const SEM_WRAP = (val: any) => (tag: any) => CONS(val)(tag);
