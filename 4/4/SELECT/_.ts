
/**
 * [4/4/SELECT/_.ts]
 * Relational select (filter)
 */
export const ATOM = ({ siblings: { FILTER } }) => (rel: any) => (pred: any) => FILTER(pred)(rel);
