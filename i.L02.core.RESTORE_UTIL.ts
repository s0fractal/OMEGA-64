// i.L02.core.RESTORE_UTIL.ts
// 🛡️ OMEGA-64 | Restoration Protocol
// "Returning the core to its rightful frequency."

import { walk } from "@std/fs";
import { join } from "@std/path";

async function restore() {
    const archiveDir = "./archive";
    const rootDir = ".";

    console.log("🧬 Starting lattice restoration...");

    for await (const entry of walk(archiveDir, { maxDepth: 1 })) {
        if (entry.isFile && entry.name.startsWith("i.")) {
            // Pattern: i.LXX.core.NAME.ts.TIMESTAMP.bak
            // We want to recover i.LXX.core.NAME.ts
            const parts = entry.name.split(".");
            // parts: ["i", "LXX", "core", "NAME", "ts", "TIMESTAMP", "bak"]
            // We need parts[0] through parts[4]
            const originalName = parts.slice(0, 5).join(".");
            
            const sourcePath = join(archiveDir, entry.name);
            const targetPath = join(rootDir, originalName);

            console.log(`📡 Recovering atom: ${entry.name} -> ${originalName}`);
            try {
                await Deno.copyFile(sourcePath, targetPath);
            } catch (err) {
                console.error(`❌ FAILED to recover ${entry.name}:`, err);
            }
        }
    }

    console.log("✅ Lattice reconstruction sequence complete.");
}

restore();
