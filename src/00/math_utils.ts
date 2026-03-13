// OMEGA-64 | math_utils.ts
// Legacy Compliance Shims - Math & Typed Arrays Helpers

export const clamp01 = (x: number): number => {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
};

export const clampByte = (x: number): number => {
  const n = Math.round(x);
  if (n < 0) return 0;
  if (n > 255) return 255;
  return n;
};

export const clampI16 = (x: number): number => {
  if (x < -32768) return -32768;
  if (x > 32767) return 32767;
  return x;
};

export const normalizeAngle = (angle: number): number => {
  const tau = 2 * Math.PI;
  let a = angle % tau;
  if (a < 0) a += tau;
  return a / tau;
};

export const toInt16BigEndian = (values: Int16Array): Uint8Array => {
  const out = new Uint8Array(values.length * 2);
  for (let i = 0; i < values.length; i++) {
    const v = values[i] < 0 ? values[i] + 0x1_0000 : values[i];
    out[i * 2] = (v >>> 8) & 0xFF;
    out[i * 2 + 1] = v & 0xFF;
  }
  return out;
};

export const makeXorShift32 = (seed: number): () => number => {
  let state = (seed >>> 0) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
};

const I16_DATA = {
  MIN: -32768,
  MAX: 32767,
  max: 32767,
  span: 65536,
  LEVEL_COUNT: 64,
};
export const I16_LIMITS_I16_LIMITS = Object.assign(() => I16_DATA, I16_DATA);
export const I16_CLAMP__00_00_I16_CLAMP = clampI16;
