
/**
 * [7/7/I16_CLAMP/_.ts]
 * 16-bit value clamping
 */
export const ATOM = ({ siblings: { I16_LIMITS } }) => (x: number) => {
  const limits = I16_LIMITS();
  return x > limits.max ? limits.max : (x < limits.min ? limits.min : x);
};
