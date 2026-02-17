
/**
 * [5/3/INTENT_AGG/_.ts]
 * Intent aggregator
 */
export const ATOM = ({ siblings: { MAP } }) => (intents: any) => MAP((i: any) => i)(intents);
