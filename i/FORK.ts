/**
 * @omega.vector 32.19.01
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L41.core.FORK.ts
 * @omega.symbol FORK
 */

import { CAR } from "./CAR.ts";
import { CDR } from "./CDR.ts";
import { CONS } from "./CONS.ts";

export const FORK = (x: any) => (f: any) => (g: any) => CONS(f(x))(g(x));
