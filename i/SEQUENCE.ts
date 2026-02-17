import { CONS } from "./CONS.ts";

export const SEQUENCE = (a: any) => (b: any) => CONS(a)(b);
