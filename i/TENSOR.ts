import { VECTOR } from "./VECTOR.ts";

export const TENSOR = (dims: any) => (values: any) => VECTOR(dims)(values);
