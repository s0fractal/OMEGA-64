
/**
 * [4/3/ACTOR/_.ts]
 * Actor constructor (Stateful lambda)
 */
export const ATOM = () => (state: any) => (behavior: any) => (msg: any) => behavior(state)(msg);
