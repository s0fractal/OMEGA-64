// OMEGA-64 | SNAP.ts | The Persistent Observer
// Asynchronously synchronizes the RAM Memory Matrix to the Disk Flatland.

import { STATE_MATRIX, MAX_ATOMS } from "./STATE_MATRIX.ts";
import { IDX_TO_ID } from "./RIBOSOME.ts";
import { parse as parseYaml, stringify as stringifyYaml } from "jsr:@std/yaml@^1.0.5";

export const SNAP = {
    // Sync Matrix State to .md Files
    save: async (root: string = Deno.cwd()) => {
        let saved = 0;
        let errors = 0;

        for (let i = 0; i < MAX_ATOMS; i++) {
            if (STATE_MATRIX.getId(i) === 0n) continue;

            const fullPath = IDX_TO_ID.get(i);
            if (!fullPath) continue;

            try {
                // @ts-ignore
                const content = await Deno.readTextFile(fullPath);
                const fmMatch = content.match(/^---\n([\s\S]+?)\n---\n/);
                if (!fmMatch) continue;

                const alpha = parseYaml(fmMatch[1]) as any;
                
                // Sync from RAM Matrix
                const x = STATE_MATRIX.getX(i);
                const y = STATE_MATRIX.getY(i);
                const energy = STATE_MATRIX.getEnergy(i);
                const resonance = STATE_MATRIX.getResonance(i);
                const phase = STATE_MATRIX.getPhase(i);

                // Only update if changed significantly or every N ticks (optimization)
                // For now, full sync
                alpha.x = x;
                alpha.y = y;
                alpha.energy = Math.floor(energy);
                alpha.resonance = Number(resonance.toFixed(2));
                alpha.phase = Number(phase.toFixed(2));

                const updated = content.replace(/^---\n[\s\S]+?\n---\n/, `---\n${stringifyYaml(alpha)}---\n`);
                // @ts-ignore
                await Deno.writeTextFile(fullPath, updated);
                saved++;
            } catch {
                errors++;
            }
        }
        
        if (saved > 0) {
            console.log(`   [SNAP] Matrix Persistence: ${saved} atoms synced to Disk. (${errors} errors)`);
        }
    }
};
