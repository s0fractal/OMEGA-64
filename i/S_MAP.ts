/**
 * @omega.vector 32.09.03
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L48.core.S_MAP.ts
 * @omega.symbol S_MAP
 */

import { CAR } from "./CAR.ts";
import { CDR } from "./CDR.ts";
import { CONS } from "./CONS.ts";
import { Y } from "./Y.ts";

export const S_MAP = Y((r: any) => (f: any) => (s: any) => CONS(f(CAR(s)))(r(f)(CDR(s))));
