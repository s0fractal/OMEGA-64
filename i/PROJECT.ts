/**
 * @omega.vector 32.31.01
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L27.core.PROJECT.ts
 * @omega.symbol PROJECT
 */

import { MAP } from "./MAP.ts";

export const PROJECT = (rel: any) => (transform: any) => MAP(transform)(rel);
