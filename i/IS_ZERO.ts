/**
 * @omega.vector 32.03.04
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L32.core.IS_ZERO.ts
 * @omega.symbol IS_ZERO
 */

import { F } from "./F.ts";
import { T } from "./T.ts";

export const IS_ZERO = (n: any) => n((x: any) => F)(T);
