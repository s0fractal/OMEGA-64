
/**
 * [0/0/I16_CLAMP/_.ts]
 * Clamps a number to the signed 16-bit range.
 */
export const ATOM = ({ siblings: { I16_LIMITS } }) => (x: number) => {
    const limits = I16_LIMITS();
    return x > limits.max ? limits.max : (x < limits.min ? limits.min : x);
};
