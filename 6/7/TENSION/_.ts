
/**
 * [6/7/TENSION/_.ts]
 * Surface/Elastic tension
 */
export const ATOM = () => (force: any) => (length: any) => force / (length + 1);
