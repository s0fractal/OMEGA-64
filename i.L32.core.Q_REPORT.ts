
// i.L32.core.Q_REPORT.ts
// Generates a distribution report of Atoms across the 64 Semantic Levels.

import { RIBOSOME } from "./i.L32.core.RIBOSOME.ts";
import { Q_PHYSICS } from "./i.L32.core.Q_PHYSICS.ts";

async function generateReport() {
    console.log("--- Q-SPACE DISTRIBUTION REPORT ---");
    console.log("Scanning Flatland...");
    
    const lattice = await RIBOSOME.lift();
    const atoms = Array.from(lattice.values());
    
    // Group by Level
    const levels = new Map<number, string[]>();
    for (const atom of atoms) {
        if (!levels.has(atom.level)) {
            levels.set(atom.level, []);
        }
        levels.get(atom.level)?.push(atom.id);
    }
    
    // Iterate 63 down to 0
    for (let l = 63; l >= 0; l--) {
        const info = Q_PHYSICS.KNOWLEDGE_MAP[l];
        const inhabitants = levels.get(l) || [];
        const count = inhabitants.length;
        const bar = "█".repeat(count);
        
        console.log(`\nL${l.toString().padStart(2, '0')} | ${info.name.padEnd(15)} | ${info.desc}`);
        if (count > 0) {
            console.log(`    Count: ${count} ${bar}`);
            // List up to 5 atoms
            inhabitants.slice(0, 5).forEach(id => console.log(`    - ${id}`));
            if (count > 5) console.log(`    ... and ${count - 5} more`);
        } else {
            console.log(`    (Void)`);
        }
    }
}

if (import.meta.main) {
    await generateReport();
}
