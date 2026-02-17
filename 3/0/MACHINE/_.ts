
/**
 * [3/0/MACHINE/_.ts]
 * State machine constructor
 */
export const ATOM = () => (transition: any) => (state: any) => (pair: any) => pair(transition)(state);
