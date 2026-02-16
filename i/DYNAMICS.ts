/**
 * @omega.vector 32.26.00
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L10.core.DYNAMICS.ts
 * @omega.symbol DYNAMICS
 */

export const DYNAMICS = (force: any) => (mass: any) => force / (mass + 1);
