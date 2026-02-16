/**
 * @omega.vector 32.27.01
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L00.core.INTERFACE.ts
 * @omega.symbol INTERFACE
 */

import { SEM_WRAP } from "./SEM_WRAP.ts";

export const INTERFACE = (x: any) => SEM_WRAP(x)("RAW");
