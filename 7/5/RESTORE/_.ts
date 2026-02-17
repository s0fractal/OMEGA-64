
import { walk } from "jsr:@std/fs";
import { join } from "jsr:@std/path";

/**
 * [7/5/RESTORE/_.ts]
 * Inverted from Legacy L02.
 */
export const ATOM = ({ siblings: { TELEMETRY_SIGNAL, TELEMETRY } }) => {
    const TS = TELEMETRY_SIGNAL;
    const T = TELEMETRY;

    return {
        execute: async () => {
            const archiveDir = "./archive";
            await TS(T("RESTORE", "Starting lattice restoration..."), "INFO");

            try {
                for await (const entry of walk(archiveDir, { maxDepth: 1 })) {
                    if (entry.isFile && entry.name.includes(".Ts.")) {
                        const parts = entry.name.split(".");
                        const originalName = parts.slice(0, -2).join(".");
                        
                        await TS(T("RESTORE", `Recovering atom: ${originalName}`), "INFO");
                        await Deno.copyFile(join(archiveDir, entry.name), originalName);
                    }
                }
            } catch (e) {
                await TS(T("RESTORE", "Restoration failed", { error: String(e) }), "ERROR");
            }

            await TS(T("RESTORE", "Lattice reconstruction sequence complete."), "INFO");
        }
    };
};
