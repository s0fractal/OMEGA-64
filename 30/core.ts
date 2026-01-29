// 🛡️ Level 30 Logic (Multiparadigm: Reactive Flux Projection)

/**
 * OBSERVABLE: A function that accepts an observer and returns a teardown.
 * λobs. λstop. (Subscription logic)
 */
// deno-lint-ignore no-explicit-any
export const OBSERVABLE = (f: any) => (obs: any) => f(obs);

/**
 * ATOM: A reactive state container.
 * λval. (State accessor/notifier)
 */
// deno-lint-ignore no-explicit-any
export const ATOM = (val: any) => (obs: any) => obs(val);

/**
 * NEXT: Notify the next value in a flux.
 */
// deno-lint-ignore no-explicit-any
export const NEXT = (val: any) => (obs: any) => obs(val);

// Atoms for this level are transfused. (lvl: 30)
