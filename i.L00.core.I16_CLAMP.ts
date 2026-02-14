import { I16_LIMITS } from "./i.L00.core.I16_LIMITS.ts";

const I16 = I16_LIMITS();

export const I16_CLAMP = (x: number) => x > I16.max ? I16.max : (x < I16.min ? I16.min : x);
