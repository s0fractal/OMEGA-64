// i.L02.core.PURGE_UTIL.ts
// 🛡️ OMEGA-64 | Structural Integrity Guard
// "The loop must survive. Only the ephemeral shall pass."

import { SIGNAL } from "./i.L64.core.SIGNAL.ts";
import { MUTATE } from "./i.L43.core.MUTATE.ts";

export const PURGE_UTIL = {
    PROTECTED_ATOMS: [
        "i.L43.core.LOOP.ts", 
        "i.L48.core.NERVE.ts", 
        "i.L32.core.RIBOSOME.ts", 
        "i.L64.core.PROJECTION.ts", 
        "i.L64.core.SIGNAL.ts",
        "i.L02.core.PURGE_UTIL.ts",
        "i.L02.core.RESTORE_UTIL.ts"
    ],

    /**
     * Executes the PURGE signals from OMEGA_SIGNAL.md.
     */
    executePurge: async () => {
        console.log("🕯️ PURGE: Commencing structural integrity cleanse...");
        let signalsTxt = "";
        try {
            signalsTxt = await Deno.readTextFile("OMEGA_SIGNAL.md");
        } catch (err) {
            console.error("❌ PURGE: Failed to read OMEGA_SIGNAL.md", err);
            return;
        }

        const purgeMatches = [...signalsTxt.matchAll(/atomId": "([^"]+)",\n  "resonance": [^,]+,\n  "judgment": "PURGE"/g)];
        const atomIdsToPurge = purgeMatches.map(m => m[1]);
        
        if (atomIdsToPurge.length === 0) {
            console.log("✨ PURGE: No compromised atoms detected.");
            return;
        }

        console.log(`🧹 PURGE: Targets identified: ${atomIdsToPurge.length}`);
        
        for (const atomId of atomIdsToPurge) {
            if (PURGE_UTIL.PROTECTED_ATOMS.includes(atomId)) {
                console.log(`🛡️ PROTECTED: Skipping purge for core atom ${atomId}`);
                continue;
            }

            try {
                // Determine if it's a core file or a virtual atom
                if (atomId.startsWith("i.")) {
                    const result = await MUTATE.archive(atomId, "CLEANSE");
                    if (!result.ok) throw new Error(result.reason);
                } else if (atomId.startsWith("v.")) {
                    await Deno.remove(atomId);
                    console.log(`🔥 PURGED: ${atomId}`);
                }
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.warn(`⚠️ PURGE FAILED for ${atomId}: ${msg}`);
            }
        }

        await SIGNAL.emit("INFO", {
            source: "PURGE_UTIL",
            message: `Structural integrity restored. ${atomIdsToPurge.length} atoms processed.`
        });
    }
};

// @ts-ignore: Deno-specific check
if (import.meta.main) {
    await PURGE_UTIL.executePurge();
}
