/**
 * @omega.vector 32.11.01
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L39.core.STEP.ts
 * @omega.symbol STEP
 */

import { MACHINE } from "./MACHINE.ts";

export const STEP = (m: any) => (input: any) => m((transition: any) => (state: any) => MACHINE(transition)(transition(state)(input)));
