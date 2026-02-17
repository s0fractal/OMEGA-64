import { CAR } from "./CAR.ts";
import { CDR } from "./CDR.ts";
import { CONS } from "./CONS.ts";
import { Y } from "./Y.ts";

export const S_MAP = Y((r: any) => (f: any) => (s: any) => CONS(f(CAR(s)))(r(f)(CDR(s))));
