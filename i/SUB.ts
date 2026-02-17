import { PRED } from "./PRED.ts";

export const SUB = (m: any) => (n: any) => n(PRED)(m);
