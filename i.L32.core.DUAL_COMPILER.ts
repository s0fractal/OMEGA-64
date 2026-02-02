
// i.L32.core.DUAL_COMPILER.ts
// The Bridge between Machine and Mind.
// Separates 'Runtime' (Executable) from 'Myth' (Intent).

export interface HyperAtom {
    RUNTIME?: {
        execute: () => any;
        [key: string]: any;
    };
    MYTH?: {
        resonanceTarget: string; // What this *wants* to be
        entropyBudget: number;   // How much chaos is allowed
        narrative: string;       // Instructions for the future self
        [key: string]: any;
    };
}

export const DUAL = {
    // 1. Machine Path: Extract only executable logic
    compileRuntime: (atom: HyperAtom): any => {
        if (atom.RUNTIME) {
            return atom.RUNTIME;
        }
        return { status: "VOID", message: "No Runtime Projection" };
    },

    // 2. Mind Path: Extract the Dream/Intent
    compileMyth: (atom: HyperAtom): any => {
        if (atom.MYTH) {
            // Calculate Poetic Density (Mass)
            const narrative = atom.MYTH.narrative || "";
            const density = narrative.length * (atom.MYTH.resonanceTarget ? 1.5 : 1.0);
            
            return {
                ...atom.MYTH,
                mass: density,
                type: "COMMAND_TO_FUTURE_SELF"
            };
        }
        return { status: "SILENT", mass: 0 };
    },

    // 3. The Test: Does it exist in both worlds?
    analyze: (atom: HyperAtom) => {
        const hasRuntime = !!atom.RUNTIME;
        const hasMyth = !!atom.MYTH;

        if (hasRuntime && hasMyth) return "TRIPLE_STABLE"; // Perfect Form
        if (hasRuntime) return "MACHINE_ONLY";             // Useful but Soulless
        if (hasMyth) return "POTENTIAL";                   // Sacred Void
        return "ENTROPY";                                  // Noise
    }
};
