/**
 * @omega.vector 32.30.00
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L28.core.ACTOR.ts
 * @omega.symbol ACTOR
 */

export const ACTOR = (state: any) => (behavior: any) => (msg: any) => behavior(state)(msg);
