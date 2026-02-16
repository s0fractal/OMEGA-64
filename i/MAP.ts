/**
 * @omega.vector 32.07.00
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L49.core.MAP.ts
 * @omega.symbol MAP
 */

import { CAR } from "./CAR.ts";
import { CDR } from "./CDR.ts";
import { CONS } from "./CONS.ts";
import { IS_NIL } from "./IS_NIL.ts";
import { NIL } from "./NIL.ts";
import { Y } from "./Y.ts";

export const MAP = Y((r: any) => (f: any) => (l: any) => IS_NIL(l)(NIL)(CONS(f(CAR(l)))(r(f)(CDR(l)))));
