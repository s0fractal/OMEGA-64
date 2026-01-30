import { CONS } from "./i.L54.core.CONS.ts";
import { CAR } from "./i.L54.core.CAR.ts";
import { CDR } from "./i.L54.core.CDR.ts";
import { NIL } from "./i.L54.core.NIL.ts";
import { IS_NIL } from "./i.L54.core.IS_NIL.ts";
import { Y } from "./i.L61.core.Y.ts"; import { CONS, CAR, CDR, NIL, IS_NIL } from "@L54/mod.ts"; export const FILTER = Y((r: any) => (p: any) => (l: any) => IS_NIL(l) (NIL) (p(CAR(l)) (CONS(CAR(l))(r(p)(CDR(l)))) (r(p)(CDR(l)))) );