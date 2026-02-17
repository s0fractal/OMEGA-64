import { CONS } from "./CONS.ts";

export const METHOD = (name: any) => (body: any) => CONS(name)(body);
