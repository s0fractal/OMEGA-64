import { HARMONIC } from "./HARMONIC.ts";

export const TENSION = (f: any) => (p1: any) => (p2: any) => HARMONIC(f(p1))(f(p2));
