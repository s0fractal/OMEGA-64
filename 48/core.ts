// 🛡️ Level 49 Logic (Atomic Operators: Infinite Streams)
import { CONS, CAR, CDR } from "./_/_/_/_/_/index.ts"; // Pairs (L54)

/**
 * STREAM: Construct a Lazy Stream (Pair where CDR is a Thunk)
 * STREAM x f = CONS x (λ_.f)
 */
// deno-lint-ignore no-explicit-any
export const STREAM = (head: any) => (tailThunk: any) => CONS(head)(tailThunk);

/** 
 * S_HEAD: Access head of stream
 */
export const S_HEAD = CAR;

/**
 * S_TAIL: Access tail of stream (evaluates the thunk)
 * S_TAIL s = (CDR s) I
 */
// deno-lint-ignore no-explicit-any
export const S_TAIL = (s: any) => CDR(s)(undefined); // Passing something to trigger the thunk

/**
 * S_MAP: Lazy Map over a stream
 */
// deno-lint-ignore no-explicit-any
export const S_MAP = (f: any) => {
    // We need recursion for this, using local Y or importing
    const Y_local = (g: any) => ((x: any) => g((v: any) => x(x)(v)))((x: any) => g((v: any) => x(x)(v)));
    return Y_local((r: any) => (s: any) => 
        STREAM(f(S_HEAD(s)))(() => r(S_TAIL(s)))
    );
};

// Atoms for this level are transfused. (lvl: 49)
