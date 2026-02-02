
// i.L32.core.RIBOSOME.ts
// The Meta-Processor for OMEGA-64 Flatland.
// Scans the Root, Lifts Atoms, and Builds the Living Map.

import { IMMUNE } from "./i.L32.core.IMMUNE.ts";
import { walk } from "jsr:@std/fs";

export interface Atom {
    id: string; // The Filename (Address)
    level: number;
    module: unknown; // The Exported Logic (unknown is safer than any)
}

export type Lattice = Map<string, Atom>;

export const RIBOSOME = {
    // Scan and Lift all Atoms (Functional)
    lift: async (root: string = "./"): Promise<Map<string, Atom>> => {
        const lattice = new Map<string, Atom>();
        console.log("🏗️ RIBOSOME: Scanning...");

        for await (const { name } of walk(root, { maxDepth: 1, includeDirs: false })) {
            const match = name.match(/i\.L(\d+)\.core\.([A-Z_]+)\.ts/);

            match && (async () => {
                const [_, lvl, _name] = match;
                try {
                    const module = await import(`./${name}`);
                    lattice.set(name, { id: name, level: parseInt(lvl), module });
                } catch (e) {
                    console.error(`⚠️ BROKEN: ${name}`, e);
                }
            })();
        }

        console.log(`✅ LIFTED: ${lattice.size} Atoms.`);
        
        // 🛡️ IMMUNE SYSTEM CHECK
        // Filter out entropy (atoms without mass/structure)
        return IMMUNE.inspect(lattice);
    },

    // Synthesis: Execute the 'mod.ts' logic dynamically if needed
    synthesize: async (lattice: Map<string, Atom>) => {
        // Find the "Main" or "Boot" atom if exists, or just return the State
        console.log("🧬 RIBOSOME: Synthesis Complete. System is Live.");
        return lattice;
    }
};

// Auto-Boot if run directly
if (import.meta.main) {
    await RIBOSOME.lift();
}
