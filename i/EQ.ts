import { F } from "./F.ts";
import { LEQ } from "./LEQ.ts";

export const EQ = (m: any) => (n: any) => LEQ(m)(n)(LEQ(n)(m))(F);
