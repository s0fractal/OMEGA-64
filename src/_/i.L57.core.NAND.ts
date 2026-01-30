import { NOT } from "./i.L59.core.NOT.ts";
import { AND } from "./i.L59.core.AND.ts";
import { NOT, AND } from "@L59/mod.ts"; export const NAND = (p: any) => (q: any) => NOT(AND(p)(q));