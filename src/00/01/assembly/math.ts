// deno-lint-ignore-file
// @ts-nocheck

// Mathematical functions (SIN_LUT, COS_LUT, math_sin, math_cos) 
// have been successfully migrated to the Ontological Graph! (src/ontology)
// They are now imported from the generated source in `src/_/mod.ts`.


// --- Fast Integer Math Helpers ---

@inline
export function fast_abs(v: i32): i32 {
  const mask = v >> 31;
  return (v + mask) ^ mask;
}

@inline
export function fast_min(a: i32, b: i32): i32 {
  const diff = a - b;
  return b + (diff & (diff >> 31));
}

@inline
export function fast_max(a: i32, b: i32): i32 {
  const diff = a - b;
  return a - (diff & (diff >> 31));
}

@inline
export function fast_sign(v: i32): i32 {
  return (v >> 31) | (<i32>(<u32>-v) >>> 31);
}
