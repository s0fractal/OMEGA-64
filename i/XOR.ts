import { NOT } from "./NOT.ts";

export const XOR = (p: any) => (q: any) => p(NOT(q))(q);
