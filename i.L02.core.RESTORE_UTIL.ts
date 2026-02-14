// i.L02.core.RESTORE_UTIL.ts
// 🛡️ OMEGA-64 | Restoration Protocol
// "Returning the core to its rightful frequency."

import { walk } from "@std/fs";
import { join } from "@std/path";
import { TELEMETRY } from "./i.L03.core.TELEMETRY.ts";
import { TELEMETRY_SIGNAL } from "./i.L02.core.TELEMETRY_SIGNAL.ts";

async function restore() {
    const archiveDir = "./archive";
    const rootDir = ".";

    await TELEMETRY_SIGNAL(TELEMETRY("RESTORE_UTIL", "Starting lattice restoration..."), "INFO");

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

            await TELEMETRY_SIGNAL(
                TELEMETRY("RESTORE_UTIL", `Recovering atom: ${entry.name} -> ${originalName}`),
                "INFO"
            );
            try {
                await Deno.copyFile(sourcePath, targetPath);
            } catch (err) {
                await TELEMETRY_SIGNAL(
                    TELEMETRY("RESTORE_UTIL", `FAILED to recover ${entry.name}`, { error: String(err) }),
                    "ERROR"
                );
            }
        }
    }

    await TELEMETRY_SIGNAL(TELEMETRY("RESTORE_UTIL", "Lattice reconstruction sequence complete."), "INFO");
}

restore();
