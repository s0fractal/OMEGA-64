export const I16_CLAMP = (x: number) => x > 32767 ? 32767 : (x < -32768 ? -32768 : x);
