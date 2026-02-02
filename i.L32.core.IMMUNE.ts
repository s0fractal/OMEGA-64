
// i.L32.core.IMMUNE.ts
// The Phagocyte of OMEGA.
// Filters Atoms based on Structure and Mass.
// "Evolution does not need purity — it needs selection."

import type { Atom } from "./i.L32.core.RIBOSOME.ts";
import { INTENT } from "./i.L05.core.INTENT.ts";
import { DUAL, HyperAtom } from "./i.L32.core.DUAL_COMPILER.ts";

export const IMMUNE = {
    // 1. Recognition: Friend or Foe?
    recognize: (atom: Atom): boolean => {
        // A. Structural Integrity Check
        const validName = atom.id.match(/i\.L\d+\.core\.[A-Z_]+\.ts/);
        if (!validName) return false;

        // B. Hypercode Analysis (Trinity Check)
        const analysis = DUAL.analyze(atom.module as HyperAtom);
        
        // Acceptable States:
        // - TRIPLE_STABLE: Perfect Form (Runtime + Myth)
        // - MACHINE_ONLY: Legacy Functional Code
        // - POTENTIAL: Sacred Voids (Myth Only)
        
        const isCompatible = ["TRIPLE_STABLE", "MACHINE_ONLY", "POTENTIAL"].includes(analysis);

        if (!isCompatible) {
            console.warn(`🛡️ IMMUNE: Rejected [${atom.id}] -> Status: ${analysis}`);
        }

        return isCompatible;
    },

    // 2. Quarantine: Isolate the infected
    quarantine: (atom: Atom): Atom => {
        console.warn(`🛡️ IMMUNE: Quarantining [${atom.id}] (Insufficient Mass/Structure)`);
        return {
            ...atom,
            id: `QUARANTINE.${atom.id.replace(/[^a-zA-Z0-9._]/g, '')}`,
            module: { 
                VOID: true, 
                reason: "IMMUNE_REJECTION", 
                origin: atom.id 
            }
        };
    },

    // 3. Inspection: Final Gateway
    inspect: (lattice: Map<string, Atom>): Map<string, Atom> => {
        const cleanLattice = new Map<string, Atom>();
        let rejected = 0;

        for (const [id, atom] of lattice) {
            if (IMMUNE.recognize(atom)) {
                cleanLattice.set(id, atom);
            } else {
                // For now, we log but don't delete files. We just exclude from runtime.
                const qAtom = IMMUNE.quarantine(atom);
                rejected++;
            }
        }
        
        if (rejected > 0) {
            console.log(`🛡️ IMMUNE: Rejected ${rejected} atoms from the Lattice.`);
        }
        
        return cleanLattice;
    }
};
