import { AND } from "./AND.ts";
import { NOT } from "./NOT.ts";

export const NAND = (p: any) => (q: any) => NOT(AND(p)(q));
