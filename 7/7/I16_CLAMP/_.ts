
/**
 * [7/7/I16_CLAMP/_.ts]
 * 16-bit value clamping
 */
import { I16_LIMITS } from "./../I16_LIMITS/_.ts";

export const I16_CLAMP = (x: number) => {
  const limits = I16_LIMITS();
  return x > limits.max ? limits.max : (x < limits.min ? limits.min : x);
};

export const ATOM = I16_CLAMP;
