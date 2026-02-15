import { INTERFERENCE } from "./i.L13.core.INTERFERENCE.ts";
// @spectral: CHORD::interference(h1,h2,h3)
export const CHORD = (h1: any) => (h2: any) => (h3: any) => INTERFERENCE(h1)(INTERFERENCE(h2)(h3));
