
// i.L43.core.MUTATE.ts
// The Hand of OMEGA-64.
// Allows the system to rewrite its own source code (Atoms).

export const MUTATE = {
    // Write content to an Atom (Atomic Write)
    write: async (atomId: string, content: string, dryRun: boolean = true) => {
        if (dryRun) {
            console.log(`✍️ [DRY RUN] MUTATE would write to ${atomId}:\n${content.slice(0, 50)}...`);
            return;
        }

        try {
            await Deno.writeTextFile(atomId, content);
            console.log(`✍️ MUTATE: Rewrote [${atomId}]. Length: ${content.length}`);
        } catch (e) {
            console.error(`❌ MUTATE FAILED [${atomId}]:`, e);
        }
    },

    // Create a backup before mutation
    backup: async (atomId: string) => {
        try {
            const content = await Deno.readTextFile(atomId);
            await Deno.writeTextFile(`${atomId}.bak`, content);
            console.log(`🛡️ BACKUP: Saved ${atomId}.bak`);
        } catch (e) {
            console.warn(`⚠️ BACKUP FAILED [${atomId}]:`, e);
        }
    }
};
