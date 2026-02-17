import { IS_ZERO } from "./IS_ZERO.ts";
import { SUB } from "./SUB.ts";

export const LEQ = (m: any) => (n: any) => IS_ZERO(SUB(m)(n));
