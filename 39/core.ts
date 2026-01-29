// 🛡️ Level 38 Logic (Flow Control: State Machines / Automata)

/**
 * MACHINE: Construct a Mealy/Moore-style state machine.
 * MACHINE transition state = PAIR transition state
 */
// deno-lint-ignore no-explicit-any
export const MACHINE = (transition: any) => (state: any) => (pair: any) => pair(transition)(state);

/**
 * STEP: Feed an input to the machine and get the next machine state.
 * STEP (MACHINE transition state) input = MACHINE transition (transition state input)
 */
// deno-lint-ignore no-explicit-any
export const STEP = (m: any) => (input: any) => 
    m((transition: any) => (state: any) => 
        MACHINE(transition)(transition(state)(input)));

/**
 * HALT (Identity mapping for final states)
 */
// deno-lint-ignore no-explicit-any
export const HALT = (s: any) => (_i: any) => s;

// Atoms for this level are transfused. (lvl: 38)
