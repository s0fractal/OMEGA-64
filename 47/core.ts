// 🛡️ Level 48 Logic (Atomic Operators: Data Primitives)
import { T, F } from "./_/_/_/_/_/_/_/_/_/_/_/index.ts"; // Booleans (L59)
import { CONS } from "./_/_/_/_/_/_/index.ts"; // Pairs (L54)

/** 
 * BIT: A functional unit of binary state.
 * BIT 0 = F, BIT 1 = T
 */
export const B0 = F;
export const B1 = T;

/**
 * BYTE: Construct an 8-bit word as a recursive CONS structure.
 * BYTE b7 b6 b5 b4 b3 b2 b1 b0
 */
// deno-lint-ignore no-explicit-any
export const BYTE = (b7: any) => (b6: any) => (b5: any) => (b4: any) => 
                  (b3: any) => (b2: any) => (b1: any) => (b0: any) =>
    CONS(b7)(CONS(b6)(CONS(b5)(CONS(b4)(CONS(b3)(CONS(b2)(CONS(b1)(b0)))))));

/**
 * BYTE_FETCH: Sequential access to bits.
 * (Using CDR/CAR pattern internally)
 */
// deno-lint-ignore no-explicit-any
export const B_READ = (byte: any) => byte;

// Atoms for this level are transfused. (lvl: 48)
