/**
 * @omega.vector 32.21.08
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L12.core.CHORD.ts
 * @omega.symbol CHORD
 */

import { INTERFERENCE } from "./INTERFERENCE_AGG.ts";

export const CHORD = (h1: any) => (h2: any) => (h3: any) => INTERFERENCE(h1)(INTERFERENCE(h2)(h3));
