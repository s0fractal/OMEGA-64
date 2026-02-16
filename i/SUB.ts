/**
 * @omega.vector 32.05.04
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L55.core.SUB.ts
 * @omega.symbol SUB
 */

import { PRED } from "./PRED.ts";

export const SUB = (m: any) => (n: any) => n(PRED)(m);
