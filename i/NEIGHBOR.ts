import { CONS } from "./CONS.ts";
import { PRED } from "./PRED.ts";
import { SUCC } from "./SUCC.ts";

export const NEIGHBOR = (n: any) => CONS(PRED(n))(SUCC(n));
