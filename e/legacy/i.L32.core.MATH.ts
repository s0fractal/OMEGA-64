// i.L32.core.MATH.ts
// DETERMINISTIC FIXPOINT MATH (Base I16.cycle)
// Ensures bit-exact results across x86, ARM, and WASM.

import { I16_LIMITS } from "./i.L00.core.I16_LIMITS.ts";

const I16 = I16_LIMITS();

export const Q = {
  SCALE: BigInt(I16.cycle),
  MASK_16: BigInt(I16.span),

  // 1. Conversion
  fromFloat: (f: number): bigint => BigInt(Math.round(f * I16.cycle)),
  toFloat: (q: bigint): number => Number(q) / I16.cycle,

  // 2. Fixed-point Multiplicaton (16.16 * 16.16 >> 16)
  mul: (a: bigint, b: bigint): bigint => (a * b) >> 16n,

  // 3. Fixed-point Division
  div: (a: bigint, b: bigint): bigint => {
    if (b === 0n) return 0n;
    return (a << 16n) / b;
  },

  // 4. Radial Distance to 0-Entropy (N=32)
  // Map L00-L63 to E -32..+32
  getEntropy: (level: number): bigint => {
    const n = BigInt(level);
    const center = 32n;
    return (n - center) * 1024n; // Scale to i16 range (I16.min..I16.max)
  },
};

// 5. LNS Logarithmic Scale (32 steps per bit)
export const LOG_LUT = new Int16Array(1024).map((_, i) =>
  Number(Math.round(Math.log2(i + 1) * 32))
);

// 6. Sine LUT (256 steps, 7-bit precision)
export const SINE_LUT = new Int8Array(256).map((_, i) =>
  Math.round(Math.sin((i / 256) * 2 * Math.PI) * 127)
);

// Unified Trig / LNS Access
export const SINGULAR_MATH = {
  getHardGravity: (r: number): number => {
    const dist = Math.abs(r);
    if (dist === 0) return 0;

    // Attraction (Long range)
    const attraction = (LOG_LUT[Math.min(dist, 1023)] || 0) >> 4;

    // Repulsion (Short range, sigma=16)
    let repulsion = 0;
    if (dist < 16) {
      repulsion = 32 >> (dist >> 2);
    }

    return attraction - repulsion;
  },
  getInterference: (deltaPhase: number): number => {
    const idx = ((deltaPhase % 256) + 256) % 256;
    return SINE_LUT[idx];
  },
};

export const MATH = { Q, LOG_LUT, SINE_LUT, SINGULAR_MATH };
