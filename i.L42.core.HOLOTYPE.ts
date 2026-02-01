
// i.L42.core.HOLOTYPE.ts
// The Holotype Aggregator.
// Collapses Projections (.ts, .rs, .md) into a Single Entity (JSON).

import { crypto } from "jsr:@std/crypto";

export interface Holotype {
    id: string; // e.g. i.L13.core.RESONANCE
    vector: string; // SHA-256 of the whole bundle
    projections: {
        ts?: string;
        rs?: string;
        md?: string;
        sh?: string;
    };
    timestamp: string;
}

export const HOLOTYPE = {
    // Collapse an Atom into a Holotype
    collapse: async (atomId: string): Promise<Holotype> => {
        // atomId example: "i.L13.core.RESONANCE" (without extension)

        const projections: any = {};
        const exts = ["ts", "rs", "md", "sh"];

        // Collect projections
        for (const ext of exts) {
            const path = `${atomId}.${ext}`;
            try {
                const content = await Deno.readTextFile(path);
                projections[ext] = content;
            } catch (e) {
                // Ignore missing projections
            }
        }

        // Calculate Identity Vector
        const contentStr = JSON.stringify(projections);
        const hashBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(contentStr));
        const vector = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

        const holotype: Holotype = {
            id: atomId,
            vector,
            projections,
            timestamp: new Date().toISOString()
        };

        return holotype;
    },

    // Save Holotype to Disk (Materialize)
    materialize: async (holotype: Holotype) => {
        const path = `${holotype.id}.json`;
        await Deno.writeTextFile(path, JSON.stringify(holotype, null, 2));
        console.log(`📦 HOLOTYPE: Materialized [${holotype.id}] (Vector: ${holotype.vector.slice(0, 8)}...)`);
    }
};

// CLI Interface
if (import.meta.main) {
    const target = Deno.args[0];
    if (!target) {
        console.error("Usage: deno run ... i.L42.core.HOLOTYPE.ts <ATOM_ID_WITHOUT_EXT>");
        Deno.exit(1);
    }

    // Normalize input (remove extension if user added it)
    const cleanTarget = target.replace(/\.(ts|rs|md|sh)$/, "");

    const h = await HOLOTYPE.collapse(cleanTarget);
    console.log(JSON.stringify(h, null, 2));
    // await HOLOTYPE.materialize(h); // Optional: Save to file
}
