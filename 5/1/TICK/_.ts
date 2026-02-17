
/**
 * [5/1/TICK/_.ts]
 * System clock tick (succ)
 */
export const ATOM = ({ siblings: { SUCC } }) => (t: any) => SUCC(t);
