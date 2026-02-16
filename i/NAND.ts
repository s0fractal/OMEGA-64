/**
 * @omega.vector 32.06.00
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L57.core.NAND.ts
 * @omega.symbol NAND
 */

import { AND } from "./AND.ts";
import { NOT } from "./NOT.ts";

export const NAND = (p: any) => (q: any) => NOT(AND(p)(q));
