// 🛡️ Level 58 Logic (Atomic Operators: Numerals)
import { I } from "./_/index.ts"; // Identity from deeper layers

/** 
 * Church Numeral: ZERO (λf.λx.x)
 * Equivalent to False (F) or (λx.I)
 */
export const N0 = <F>(_: F) => I;

/**
 * Church Numeral: ONE (λf.λx.f x)
 */
export const N1 = <F>(f: F) => f;

/**
 * Successor Function: SUCC n = λn.λf.λx.f (n f x)
 */
// deno-lint-ignore no-explicit-any
export const SUCC = (n: any) => (f: any) => (x: any) => f(n(f)(x));

/** Church Numeral: TWO */
export const N2 = SUCC(N1);

/** Church Numeral: THREE */
export const N3 = SUCC(N2);

/**
 * Addition: ADD m n = λm.λn.λf.λx.m f (n f x) 
 * (Applying 'f' n times, then m times)
 */
// deno-lint-ignore no-explicit-any
export const ADD = (m: any) => (n: any) => (f: any) => (x: any) => m(f)(n(f)(x));

// Atoms for this level are transfused. (lvl: 58)
