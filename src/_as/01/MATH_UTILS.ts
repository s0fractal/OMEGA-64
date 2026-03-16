// SSoT: file:///Users/s0fractal/OMEGA/src/ontology/math/MATH_UTILS.md
export function normalize_angle(angle: f64): f64 {
  const tau: f64 = 2.0 * Math.PI;
  let a: f64 = angle % tau;
  if (a < 0.0) a += tau;
  return a / tau;
}

export function clamp01(x: f64): f64 {
  if (x < 0.0) return 0.0;
  if (x > 1.0) return 1.0;
  return x;
}

export function fast_sign(v: i32): i32 {
  return (v >> 31) | (<i32>(<u32>-v) >>> 31);
}

export function calculate_shannon_entropy(data: usize): i32 {
  // Logic not yet ported to pure AS without LUT access
  return 0;
}