/**
 * @omega.vector 32.18.03
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L26.core.MEANING.ts
 * @omega.symbol MEANING
 */

import { CONS } from "./CONS.ts";

export const MEANING = (tag: any) => (val: any) => CONS(tag)(val);
