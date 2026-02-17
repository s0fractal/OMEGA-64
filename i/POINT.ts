import { TRIPLE } from "./TRIPLE.ts";

export const POINT = (x: any) => (y: any) => (z: any) => TRIPLE(x)(y)(z);
