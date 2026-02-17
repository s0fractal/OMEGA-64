
/**
 * [7/5/PURGE/_.ts]
 * Inverted from Legacy L02.
 */
export const ATOM = ({ siblings: { TELEMETRY_SIGNAL, TELEMETRY, MUTATE } }) => {
    const TS = TELEMETRY_SIGNAL;
    const T = TELEMETRY;

    const PROTECTED_ATOMS = [
        "4/0/RIBOSOME/_.ts",
        "4/0/IMMUNE/_.ts",
        "7/5/PURGE/_.ts",
        "7/5/RESTORE/_.ts"
    ];

    return {
        execute: async () => {
            await TS(T("PURGE", "Commencing structural integrity cleanse..."), "INFO");
            let signalsTxt = "";
            try {
                signalsTxt = await Deno.readTextFile("OMEGA_SIGNAL.md");
            } catch (err) {
                await TS(T("PURGE", "Failed to read OMEGA_SIGNAL.md", { error: String(err) }), "ERROR");
                return;
            }

            const purgeMatches = [...signalsTxt.matchAll(/atomId": "([^"]+)",\n\s+"resonance": [^,]+,\n\s+"judgment": "PURGE"/g)];
            const atomIdsToPurge = purgeMatches.map(m => m[1]);
            
            if (atomIdsToPurge.length === 0) {
                await TS(T("PURGE", "No compromised atoms detected."), "INFO");
                return;
            }

            for (const atomId of atomIdsToPurge) {
                if (PROTECTED_ATOMS.some(p => atomId.includes(p))) continue;

                try {
                    const M = await MUTATE();
                    const result = await M.archive(atomId, "CLEANSE");
                    if (!result.ok) throw new Error(result.reason);
                } catch (err) {
                    await TS(T("PURGE", `Purge failed for ${atomId}`, { error: String(err) }), "WARNING");
                }
            }

            await TS(T("PURGE", `Structural integrity restored.`), "INFO");
        }
    };
};
