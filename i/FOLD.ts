/**
 * @omega.vector 32.07.01
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L49.core.FOLD.ts
 * @omega.symbol FOLD
 */

import { CAR } from "./CAR.ts";
import { CDR } from "./CDR.ts";
import { IS_NIL } from "./IS_NIL.ts";
import { Y } from "./Y.ts";

export const FOLD = Y((r: any) => (f: any) => (init: any) => (l: any) => IS_NIL(l)(init)(f(CAR(l))(r(f)(init)(CDR(l)))));
