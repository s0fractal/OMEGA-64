
/**
 * [7/5/PROJECT/_.ts]
 * Relational projection (List map)
 */
export const ATOM = ({ siblings: { MAP } }) => (rel: any) => (transform: any) => MAP(transform)(rel);
