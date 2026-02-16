/**
 * @omega.vector 32.15.05
 * @omega.readonly
 * @omega.load 0
 * @omega.origin i.L45.core.EITHER_CASE.ts
 * @omega.symbol EITHER_CASE
 */

export const EITHER_CASE = (e: any) => (leftCase: any) => (rightCase: any) => e(leftCase)(rightCase);
