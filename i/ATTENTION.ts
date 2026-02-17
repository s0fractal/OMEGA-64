import { FORCE } from "./FORCE.ts";

export const ATTENTION = (f: any) => (filter: any) => (p: any) => filter(p) ? f(p) : FORCE(p);
