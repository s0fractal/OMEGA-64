
// i.L32.core.RIBOSOME.ts
// The Meta-Processor for OMEGA-64 Flatland.
// Scans the Root, Lifts Atoms, and Builds the Living Map.

import { IMMUNE } from "./i.L32.core.IMMUNE.ts";
import { DUAL } from "./i.L32.core.DUAL.ts";
import { walk } from "jsr:@std/fs";

export interface Atom {
    id: string; // The Filename (Address)
    level: number;
    module: any; // The Exported Logic
    topo?: { r: number, theta: number, op: string }; // Topological Metadata
}

export type Lattice = Map<string, Atom>;

export const RIBOSOME = {
    // Scan and Lift all Atoms (Functional)
    lift: async (root: string = "./"): Promise<Map<string, Atom>> => {
        let lattice = new Map<string, Atom>();
        console.log("🏗️ RIBOSOME: Scanning Root...");

        for await (const { name } of walk(root, { maxDepth: 1, includeDirs: false })) {
            const match = name.match(/i\.L(\d+)\.core\.([A-Z_]+)\.ts/);
            if (match) {
                const [_, lvl, _name] = match;
                try {
                    if (DUAL.validate(name, Deno.readTextFileSync(`${root}/${name}`))) {
                        const module = await import(`./${name}`);
                        lattice.set(name, { id: name, level: parseInt(lvl), module });
                    }
                } catch (e) {
                    console.error(`⚠️ BROKEN: ${name}`, e);
                }
            }
        }

        // --- Phase 1.1: Lift the Vacuum ---
        lattice = await RIBOSOME.liftVacuum(lattice);

        console.log(`✅ LIFTED: ${lattice.size} Atoms.`);
        
        // 🛡️ IMMUNE SYSTEM CHECK
        return IMMUNE.inspect(lattice);
    },

    // Lift Crystallized Atoms from the Vacuum
    liftVacuum: async (lattice: Map<string, Atom>): Promise<Map<string, Atom>> => {
        try {
            const manifestPath = "./SINGULARITY/V/mod.ts";
            console.log(`🌌 RIBOSOME: Importing Vacuum from ${manifestPath}...`);
            const { VACUUM } = await import(manifestPath);
            
            if (!VACUUM) {
                console.warn("⚠️ VACUUM EMPTY: Export not found in mod.ts");
                return lattice;
            }

            const entries = Object.entries(VACUUM);
            console.log(`🌌 RIBOSOME: Found ${entries.length} atoms in Vacuum manifest.`);

            for (const [hash, data] of entries) {
                const id = `v.${hash}.ts`;
                lattice.set(id, {
                    id,
                    level: 32,
                    module: (data as any),
                    topo: { 
                        r: (data as any).r, 
                        theta: (data as any).theta, 
                        op: (data as any).op 
                    }
                });
            }
        } catch (e) {
            console.warn("⚠️ VACUUM FAILED:", (e as Error).message);
            console.warn("Stack:", (e as Error).stack);
        }
        return lattice;
    },

    // Synthesis: Execute the 'mod.ts' logic dynamically if needed
    synthesize: async (lattice: Map<string, Atom>) => {
        console.log("🧬 RIBOSOME: Synthesis Complete. System is Live.");
        return lattice;
    }
};

// Auto-Boot if run directly
if (import.meta.main) {
    await RIBOSOME.lift();
}
