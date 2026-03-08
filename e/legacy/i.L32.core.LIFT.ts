import { CAR } from "./i.L32.core.CAR.ts";
import { CDR } from "./i.L32.core.CDR.ts";
import { CONS } from "./i.L32.core.CONS.ts";
export const LIFT = (f: any) => (obj: any) => CONS(f(CAR(obj)))(CDR(obj));
