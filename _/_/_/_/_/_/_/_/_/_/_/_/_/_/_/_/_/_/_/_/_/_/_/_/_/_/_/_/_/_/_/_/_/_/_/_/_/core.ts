// 🛡️ Level 43 Logic (Flow Control: Atomic Log / Writer)
import { CONS } from "./_/_/_/_/_/_/_/_/_/_/_/index.ts"; // Pairs (L54)

/**
 * WRITER: A computation that produces a value and a log.
 * WRITER = λa.λw.PAIR a w
 */
// deno-lint-ignore no-explicit-any
export const WRITER = (a: any) => (w: any) => (pair: any) => pair(a)(w);

/**
 * TELL: Produce a log entry with no meaningful result.
 * TELL w = PAIR NULL w
 */
// deno-lint-ignore no-explicit-any
export const TELL = (w: any) => (pair: any) => pair(undefined)(w);

/**
 * LISTEN: Extract the log from a writer.
 */
// deno-lint-ignore no-explicit-any
export const LISTEN = (writer: any) => (pair: any) => 
    writer((a: any) => (w: any) => pair(a)(w));

// Atoms for this level are transfused. (lvl: 43)
