import { CONS } from "./CONS.ts";

export const SEM_WRAP = (val: any) => (tag: any) => CONS(val)(tag);
