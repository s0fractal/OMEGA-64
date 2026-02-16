/**
 * @omega.vector 32.20.02
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L11.core.TENSION.ts
 * @omega.symbol TENSION
 */

import { HARMONIC } from "./HARMONIC.ts";

export const TENSION = (f: any) => (p1: any) => (p2: any) => HARMONIC(f(p1))(f(p2));
