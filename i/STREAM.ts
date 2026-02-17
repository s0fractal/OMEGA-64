import { CONS } from "./CONS.ts";

export const STREAM = (head: any) => (tailThunk: any) => CONS(head)(tailThunk);
