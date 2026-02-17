import { INTERFERENCE } from "./INTERFERENCE_AGG.ts";

export const CHORD = (h1: any) => (h2: any) => (h3: any) => INTERFERENCE(h1)(INTERFERENCE(h2)(h3));
