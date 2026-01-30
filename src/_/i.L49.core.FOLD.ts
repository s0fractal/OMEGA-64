import { CAR } from "./i.L54.core.CAR.ts";
import { CDR } from "./i.L54.core.CDR.ts";
import { IS_NIL } from "./i.L54.core.IS_NIL.ts";
import { Y } from "./i.L61.core.Y.ts"; import { CAR, CDR, IS_NIL } from "@L54/mod.ts"; export const FOLD = Y((r: any) => (f: any) => (init: any) => (l: any) => IS_NIL(l) (init) (f(CAR(l))(r(f)(init)(CDR(l)))) );