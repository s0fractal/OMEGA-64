
/**
 * [1/0/DYNAMICS/_.ts]
 * Physical dynamics (Force/Mass)
 */
export const ATOM = () => (force: any) => (mass: any) => force / (mass + 1);
