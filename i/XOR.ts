/**
 * @omega.vector 32.06.01
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L57.core.XOR.ts
 * @omega.symbol XOR
 */

import { NOT } from "./NOT.ts";

export const XOR = (p: any) => (q: any) => p(NOT(q))(q);
