/**
 * @omega.vector 32.17.07
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L24.core.POINT.ts
 * @omega.symbol POINT
 */

import { TRIPLE } from "./TRIPLE.ts";

export const POINT = (x: any) => (y: any) => (z: any) => TRIPLE(x)(y)(z);
