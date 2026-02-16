/**
 * @omega.vector 32.05.05
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L55.core.LEQ.ts
 * @omega.symbol LEQ
 */

import { IS_ZERO } from "./IS_ZERO.ts";
import { SUB } from "./SUB.ts";

export const LEQ = (m: any) => (n: any) => IS_ZERO(SUB(m)(n));
