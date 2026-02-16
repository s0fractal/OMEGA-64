/**
 * @omega.vector 32.07.02
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L49.core.FILTER.ts
 * @omega.symbol FILTER
 */

import { CAR } from "./CAR.ts";
import { CDR } from "./CDR.ts";
import { CONS } from "./CONS.ts";
import { IS_NIL } from "./IS_NIL.ts";
import { NIL } from "./NIL.ts";
import { Y } from "./Y.ts";

export const FILTER = Y((r: any) => (p: any) => (l: any) => IS_NIL(l)(NIL)(p(CAR(l))(CONS(CAR(l))(r(p)(CDR(l))))(r(p)(CDR(l)))));
