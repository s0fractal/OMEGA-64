
/**
 * [7/0/WEIGHT/_.ts]
 * Gravitational weight force
 */
export const ATOM = ({ siblings: { GRAVITY } }) => (mass: any) => mass * GRAVITY();
