/**
 * @omega.vector 32.29.01
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L31.core.METHOD.ts
 * @omega.symbol METHOD
 */

import { CONS } from "./CONS.ts";

export const METHOD = (name: any) => (body: any) => CONS(name)(body);
