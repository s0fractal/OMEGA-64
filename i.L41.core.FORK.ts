import { CONS } from "./i.L32.core.CONS.ts";
import { CAR } from "./i.L32.core.CAR.ts";
import { CDR } from "./i.L32.core.CDR.ts";

export const FORK = (x: any) => (f: any) => (g: any) => CONS(f(x))(g(x));

export const JOIN = (pair: any) => (merger: any) => merger(CAR(pair), CDR(pair));