import { I16_LIMITS } from "./I16_LIMITS.ts";

export const I16_CLAMP = (x: number) => {
  const limits = I16_LIMITS();
  return x > limits.max ? limits.max : (x < limits.min ? limits.min : x);
};
