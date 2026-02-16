/**
 * @omega.vector 32.22.03
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L21.core.GRAVITY.ts
 * @omega.symbol GRAVITY
 */

import { CONS } from "./CONS.ts";

export const GRAVITY = (m: any) => (body: any) => CONS(m)(body);
