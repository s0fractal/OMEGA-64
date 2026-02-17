
/**
 * [4/3/BECOME/_.ts]
 * Actor behavior transition
 */
export const ATOM = ({ siblings: { ACTOR } }) => (nextState: any) => (nextBehavior: any) => ACTOR(nextState)(nextBehavior);
