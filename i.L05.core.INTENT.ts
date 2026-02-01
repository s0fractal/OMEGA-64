
// i.L05.core.INTENT.ts
// The Teleology of OMEGA.
// Defines the difference between Noise and Signal.

export const INTENT = {
    // The Ghost in the Shell.
    // Axiom: We want the system to Grow (Increase Mutation Count).

    judge: (oldState: any, newState: any): number => {
        if (!oldState || !newState) return 0;

        const growth = newState.mutations - oldState.mutations;

        if (growth > 0) return 1;    // GOOD
        if (growth < 0) return -1;   // BAD (Regression)
        return 0;                    // STAGNATION
    }
};