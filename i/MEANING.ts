import { CONS } from "./CONS.ts";

export const MEANING = (tag: any) => (val: any) => CONS(tag)(val);
