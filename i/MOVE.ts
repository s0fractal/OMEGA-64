/**
 * @omega.vector 32.17.08
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L24.core.MOVE.ts
 * @omega.symbol MOVE
 */

import { POINT } from "./POINT.ts";

export const MOVE = (p: any) => (v: any) => v((vx: any) => (vy: any) => (vz: any) => p((px: any) => (py: any) => (pz: any) => POINT(px)(py)(pz)));
