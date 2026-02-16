/**
 * @omega.vector 32.22.04
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L21.core.MASS.ts
 * @omega.symbol MASS
 */

import { I16_LIMITS } from "../i.L32.core.I16_LIMITS.ts";

const I16 = I16_LIMITS();

export const MASS = (q: any) => I16.max - q.evt;
