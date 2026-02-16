import { I16_LIMITS } from "./i.L32.core.I16_LIMITS.ts";

const I16 = I16_LIMITS();

export const MASS = (q: any) => I16.max - q.evt;
