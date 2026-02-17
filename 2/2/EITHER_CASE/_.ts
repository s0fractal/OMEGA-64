
/**
 * [2/2/EITHER_CASE/_.ts]
 * Either Monad: Case analysis
 */
export const ATOM = () => (e: any) => (leftCase: any) => (rightCase: any) => e(leftCase)(rightCase);
