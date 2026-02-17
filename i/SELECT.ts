import { FILTER } from "./FILTER.ts";

export const SELECT = (rel: any) => (pred: any) => FILTER(pred)(rel);
