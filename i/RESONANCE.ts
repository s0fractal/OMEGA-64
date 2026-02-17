import { SIGNAL } from "./SIGNAL.ts";

export const RESONANCE = (a: any) => (b: any) => (a === b ? SIGNAL(a) : SIGNAL(b));
