import { CONS } from "./CONS.ts";

export const VECTOR = (dim: any) => (values: any) => CONS(dim)(values);
