// OMEGA-64 | SNAP.ts | The Persistent Observer (Era 15)
// Transactional synchronization of RAM Memory Matrix to the Disk Flatland.

import { MAX_ATOMS, STATE_MATRIX } from "./STATE_MATRIX.ts";
import { IDX_TO_ID } from "./RIBOSOME.ts";
import {
  parse as parseYaml,
  stringify as stringifyYaml,
} from "jsr:@std/yaml@^1.0.5";
import { LOGGER } from "./LOGGER.ts";

export const SNAP = {
  // Sync Matrix State to .md Files with Atomic "Write-then-Rename"
  save: async (root: string = Deno.cwd()) => {
    let saved = 0;
    let errors = 0;

    for (let i = 0; i < MAX_ATOMS; i++) {
      if (STATE_MATRIX.getId(i) === 0n) continue;

      const fullPath = IDX_TO_ID.get(i);
      if (!fullPath) continue;

      try {
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

        // Update Frontmatter
        alpha.x = x;
        alpha.y = y;
        alpha.energy = Math.floor(energy);
        alpha.resonance = Number(resonance.toFixed(3));
        alpha.phase = Number(phase.toFixed(3));

        const updated = content.replace(
          /^---\n[\s\S]+?\n---\n/,
          `---\n${stringifyYaml(alpha)}---\n`,
        );

        // --- ATOMIC WRITE STRATEGY ---
        const tmpPath = `${fullPath}.tmp`;
        await Deno.writeTextFile(tmpPath, updated);
        await Deno.rename(tmpPath, fullPath); // Atomic operation on Unix

        saved++;
      } catch {
        errors++;
      }
    }

    if (saved > 0) {
      LOGGER.info(
        `   [SNAP] Transactional Sync: ${saved} atoms committed to Disk. (${errors} errors)`,
      );
    }
  },
};
