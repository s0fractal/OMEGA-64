/**
 * @omega.vector 32.31.02
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L27.core.SELECT.ts
 * @omega.symbol SELECT
 */

import { FILTER } from "./FILTER.ts";

export const SELECT = (rel: any) => (pred: any) => FILTER(pred)(rel);
