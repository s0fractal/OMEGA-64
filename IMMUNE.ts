// IMMUNE.ts
// The Phagocyte of OMEGA.
// Filters Atoms based on Structure and Mass.

import type { Atom } from "./RIBOSOME.ts";

export const IMMUNE = {
    // Recognition: Friend or Foe?
    recognize: (atom: Atom): boolean => {
        // Flatland Recognition: 0x...ID...SYMBOL.md
        if (atom.id.startsWith("0x") && atom.id.endsWith(".md")) {
            return true;
        }

        // Vacuum Recognition
        if (atom.id.startsWith("v.")) {
            return true;
        }

        return false;
    },

    // Inspection: Final Gateway
    inspect: (lattice: Map<string, Atom>): Map<string, Atom> => {
        const cleanLattice = new Map<string, Atom>();
        for (const [id, atom] of lattice) {
            if (IMMUNE.recognize(atom)) {
                cleanLattice.set(id, atom);
            }
        }
        return cleanLattice;
    }
};
