/**
 * @omega.vector 32.18.00
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L38.core.NEIGHBOR.ts
 * @omega.symbol NEIGHBOR
 */

import { CONS } from "./CONS.ts";
import { PRED } from "./PRED.ts";
import { SUCC } from "./SUCC.ts";

export const NEIGHBOR = (n: any) => CONS(PRED(n))(SUCC(n));
