/**
 * @omega.vector 32.05.06
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L55.core.EQ.ts
 * @omega.symbol EQ
 */

import { F } from "./F.ts";
import { LEQ } from "./LEQ.ts";

export const EQ = (m: any) => (n: any) => LEQ(m)(n)(LEQ(n)(m))(F);
