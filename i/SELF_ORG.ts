/**
 * @omega.vector 32.24.05
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L07.core.SELF_ORG.ts
 * @omega.symbol SELF_ORG
 */

import { NEURON } from "./NEURON.ts";

export const SELF_ORG = (s: any) => (a: any) => NEURON(s)(a);
