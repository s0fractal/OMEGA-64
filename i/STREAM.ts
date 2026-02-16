/**
 * @omega.vector 32.09.00
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L48.core.STREAM.ts
 * @omega.symbol STREAM
 */

import { CONS } from "./CONS.ts";

export const STREAM = (head: any) => (tailThunk: any) => CONS(head)(tailThunk);
