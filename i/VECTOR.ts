/**
 * @omega.vector 32.17.02
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L23.core.VECTOR.ts
 * @omega.symbol VECTOR
 */

import { CONS } from "./CONS.ts";

export const VECTOR = (dim: any) => (values: any) => CONS(dim)(values);
