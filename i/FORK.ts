import { CAR } from "./CAR.ts";
import { CDR } from "./CDR.ts";
import { CONS } from "./CONS.ts";

export const FORK = (x: any) => (f: any) => (g: any) => CONS(f(x))(g(x));
