/**
 * @omega.vector 32.20.04
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L16.core.RESONANCE.ts
 * @omega.symbol RESONANCE
 */

import { SIGNAL } from "./SIGNAL.ts";

export const RESONANCE = (a: any) => (b: any) => (a === b ? SIGNAL(a) : SIGNAL(b));
