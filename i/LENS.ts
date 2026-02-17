import { CONS } from "./CONS.ts";

export const LENS = (g: any) => (s: any) => CONS(g)(s);
