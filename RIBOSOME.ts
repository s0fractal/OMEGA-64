/// <reference lib="deno.window" />
// i.L32.core.RIBOSOME.ts
// The Meta-Processor for OMEGA-64 Flatland.
// Scans the Root, Lifts Atoms, and Builds the Living Map.

import { IMMUNE } from "./IMMUNE.ts";
import { DUAL } from "./DUAL.md"; // Using the crystallized logic via import if possible, or dynamic
import { walk } from "jsr:@std/fs";
import { parse as parseYaml } from "jsr:@std/yaml";

export interface Atom {
    id: string; // The Filename (Address)
    level: number;
    module: any; // The Exported Logic
    symbol: string;
    topo?: { r: number, theta: number, op: string };
}

export type Lattice = Map<string, Atom>;

export const RIBOSOME = {
    // Scan and Lift all Atoms in Flatland (./0x*.md)
    lift: async (root: string = Deno.cwd()): Promise<Map<string, Atom>> => {
        const lattice = new Map<string, Atom>();

        for await (const entry of Deno.readDir(root)) {
            if (entry.isFile && entry.name.startsWith("0x") && entry.name.endsWith(".md")) {
                const content = await Deno.readTextFile(entry.name);
                const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
                if (!frontmatterMatch) continue;

                const alpha = parseYaml(frontmatterMatch[1]) as any;
                const symbol = alpha.symbol ?? entry.name.split('.')[1] ?? "UNKNOWN";
                const level = alpha.level ?? (alpha.vector ? parseInt(alpha.vector.split('.')[0]) : 0);

                // For runtime execution, we usually need the BLUE block
                // But for now, we just store the metadata
                lattice.set(entry.name, {
                    id: entry.name,
                    level: level,
                    symbol: symbol,
                    module: null // Module loading happens during specialized injection or dynamic import
                });
            }
        }

        // 🛡️ IMMUNE SYSTEM CHECK
        return IMMUNE.inspect(lattice);
    },

    // Inject Dependencies into a Pure Atom (Adapted for Flatland)
    inject: async (id: string, lattice: Map<string, Atom>) => {
        const target = lattice.get(id);
        if (!target) return null;

        // Implementation for Flatland injection...
        return null; 
    }
};

if (import.meta.main) {
    const lattice = await RIBOSOME.lift();
    console.log(`[RIBOSOME] Flatland Lifted: ${lattice.size} atoms.`);
}
