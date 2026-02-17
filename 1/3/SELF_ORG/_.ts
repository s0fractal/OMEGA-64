
/**
 * [1/3/SELF_ORG/_.ts]
 * Self-organization dynamics
 */
export const ATOM = ({ siblings: { NEURON } }) => (s: any) => (a: any) => NEURON(s)(a);
