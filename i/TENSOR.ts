/**
 * @omega.vector 32.17.03
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L23.core.TENSOR.ts
 * @omega.symbol TENSOR
 */

import { VECTOR } from "./VECTOR.ts";

export const TENSOR = (dims: any) => (values: any) => VECTOR(dims)(values);
