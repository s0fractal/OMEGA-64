/**
 * @omega.vector 32.03.03
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L32.core.IS_NIL.ts
 * @omega.symbol IS_NIL
 */

import { F } from "./F.ts";
import { T } from "./T.ts";

export const IS_NIL = (l: any) => l((h: any) => (t: any) => F)(T);
