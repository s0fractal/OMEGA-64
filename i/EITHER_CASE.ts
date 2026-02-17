export const EITHER_CASE = (e: any) => (leftCase: any) => (rightCase: any) => e(leftCase)(rightCase);
